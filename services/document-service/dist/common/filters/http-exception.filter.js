"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        if (exception instanceof multer_1.MulterError) {
            switch (exception.code) {
                case 'LIMIT_FILE_SIZE':
                    status = common_1.HttpStatus.PAYLOAD_TOO_LARGE;
                    message = 'File quá lớn. Kích thước tối đa cho phép là 10 MB.';
                    break;
                case 'LIMIT_FILE_COUNT':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Chỉ được upload 1 file mỗi request.';
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message =
                        'Tên field không đúng. Dùng field name là "file" trong form-data.';
                    break;
                default:
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = `Lỗi upload: ${exception.message}`;
            }
            this.logger.warn(`MulterError [${exception.code}]: ${exception.message}`);
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse;
                message = res.message || exception.message;
            }
            else {
                message = exception.message;
            }
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Lỗi hệ thống, vui lòng thử lại sau.';
            this.logger.error('Unhandled exception:', exception);
        }
        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map