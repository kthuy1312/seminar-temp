"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const user_entity_1 = require("../entities/user.entity");
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, refreshTokenRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã được sử dụng');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const user = this.userRepository.create({
            email: dto.email,
            password: hashedPassword,
            fullName: dto.fullName,
        });
        const savedUser = await this.userRepository.save(user);
        this.logger.log(`User registered: ${savedUser.email}`);
        const tokens = await this.generateTokens(savedUser);
        return {
            user: this.sanitizeUser(savedUser),
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        this.logger.log(`User logged in: ${user.email}`);
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async refreshToken(refreshTokenValue) {
        const storedToken = await this.refreshTokenRepository.findOne({
            where: {
                token: refreshTokenValue,
                isRevoked: false,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            relations: ['user'],
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
        storedToken.isRevoked = true;
        await this.refreshTokenRepository.save(storedToken);
        const tokens = await this.generateTokens(storedToken.user);
        this.logger.log(`Token refreshed for user: ${storedToken.user.email}`);
        return {
            user: this.sanitizeUser(storedToken.user),
            ...tokens,
        };
    }
    async logout(refreshTokenValue) {
        const result = await this.refreshTokenRepository.update({ token: refreshTokenValue, isRevoked: false }, { isRevoked: true });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Token không tìm thấy');
        }
        return { message: 'Đăng xuất thành công' };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        return this.sanitizeUser(user);
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        if (dto.fullName !== undefined)
            user.fullName = dto.fullName;
        if (dto.avatarUrl !== undefined)
            user.avatarUrl = dto.avatarUrl;
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`Profile updated for user: ${updatedUser.email}`);
        return this.sanitizeUser(updatedUser);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExpiresIn'),
        });
        const refreshTokenValue = (0, uuid_1.v4)();
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn') || '7d';
        const expiresAt = this.calculateExpiry(refreshExpiresIn);
        const refreshToken = this.refreshTokenRepository.create({
            userId: user.id,
            token: refreshTokenValue,
            expiresAt,
        });
        await this.refreshTokenRepository.save(refreshToken);
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: this.configService.get('jwt.accessExpiresIn'),
        };
    }
    sanitizeUser(user) {
        const { password, refreshTokens, ...result } = user;
        return result;
    }
    calculateExpiry(duration) {
        const now = new Date();
        const value = parseInt(duration);
        const unit = duration.replace(/\d+/g, '');
        switch (unit) {
            case 'm':
                now.setMinutes(now.getMinutes() + value);
                break;
            case 'h':
                now.setHours(now.getHours() + value);
                break;
            case 'd':
                now.setDate(now.getDate() + value);
                break;
            default:
                now.setDate(now.getDate() + 7);
        }
        return now;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map