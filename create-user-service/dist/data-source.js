"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("./src/config/typeorm.config");
exports.AppDataSource = new typeorm_1.DataSource(typeorm_config_1.typeOrmConfig);
//# sourceMappingURL=data-source.js.map