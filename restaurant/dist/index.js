"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const restaurant_1 = __importDefault(require("./routes/restaurant"));
const menuitem_1 = __importDefault(require("./routes/menuitem"));
const cart_1 = __importDefault(require("./routes/cart"));
const cors_1 = __importDefault(require("cors"));
const address_1 = __importDefault(require("./routes/address"));
const rabbitmq_1 = require("./config/rabbitmq");
const payment_consumer_1 = require("./config/payment.consumer");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5001;
app.use("/api/restaurant", restaurant_1.default);
app.use("/api/item", menuitem_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/address", address_1.default);
const startServer = async () => {
    try {
        await (0, rabbitmq_1.connectRabbitMQ)();
        (0, payment_consumer_1.startPaymentConsumer)();
        await (0, db_1.default)();
        app.listen(PORT, () => {
            console.log(`Restaurant service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};
startServer();
