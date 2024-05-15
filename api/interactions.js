const {InteractionType, InteractionResponseType,verifyKey} = require("discord-interactions");
const {ValidationException, UnhandledData} = require("../utils/exceptions");
const {IncomingHttpHeaders} = require("http");
const { getLink } = require("../scripts/interactions/getLink");

const verifySig = async (body, header) => {
    const sig = header["x-signature-ed25519"];
    const timestamp = header["x-signature-timestamp"];
    const isValid = verifyKey(JSON.stringify(body), sig, timestamp, process.env.PRIVATE_DISCORD_PUBLIC_KEY)
    if (!isValid) {
        throw new ValidationException("Invalid request signature", 401);
    }
}

const handleResponse = async (body) => {
    const { type, id, data } = body;

    if (type === InteractionType.PING) {
        return { type: InteractionResponseType.PONG };
    }
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        switch (name) {
            case "getlink":
                return await getLink(data);
            default:
                throw new UnhandledData("Unhandled Data", 401);
        }
    }
}

exports.handler = async (event, context) => {
    console.log("interactionEvent");
    console.log(event);
    console.log(context);
}