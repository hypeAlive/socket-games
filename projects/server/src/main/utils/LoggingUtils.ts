import winston from "winston";

export default class LoggingUtils {

    static createLogger(serviceName: string, color: string) {
        return winston.createLogger({
            defaultMeta: { service: serviceName,  },
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp, service }) =>
                    `${timestamp} [${color}${service}\x1b[0m] [${level}]: ${message}`)
            ),
            transports: [
                new winston.transports.Console()
            ]
        });
    }

}