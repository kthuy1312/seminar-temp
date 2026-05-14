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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
let JwtMiddleware = class JwtMiddleware {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger('JwtMiddleware');
        this.jwtSecret = this.configService.get('JWT_ACCESS_SECRET', 'JUSTASECRET');
    }
    use(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Missing Authorization header');
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization format. Expected: Bearer <token>');
        }
        try {
            const payload = jwt.verify(token, this.jwtSecret);
            req.user = payload;
            const userId = payload.sub || payload.id;
            if (userId) {
                req.headers['x-user-id'] = userId;
            }
            this.logger.debug(`JWT verified for user: ${userId}`);
            next();
        }
        catch (error) {
            this.logger.warn(`JWT verification failed: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.JwtMiddleware = JwtMiddleware;
exports.JwtMiddleware = JwtMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtMiddleware);
//# sourceMappingURL=jwt.middleware.js.map