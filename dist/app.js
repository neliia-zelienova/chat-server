"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = require("morgan");
const cors_1 = __importDefault(require("cors"));
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
var usersRouter = require("./routes/users");
var app = (0, express_1.default)();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use((0, morgan_1.logger)(formatsLogger));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/users", usersRouter);
app.use((req, res) => {
    res.status(404).json({ status: "error", code: 404, message: "Not found" });
});
app.use((err, req, res, next) => {
    const code = err.status || 500;
    const status = err.status ? "error" : "fail";
    res.status(code).json({ status, code, message: err.message });
});
module.exports = app;
