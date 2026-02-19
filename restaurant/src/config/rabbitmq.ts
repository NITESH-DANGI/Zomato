import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);

    channel = await connection.createChannel();

    await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
      durable: true,
    });
    console.log("connected to Rabbitmq(Restaurant)");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ. Background tasks will not work.");
    console.error("Error:", error);
  }
};

export const getChannel = () => channel;
