const discordHeaders = {
    Authorization: `Bot ${process.env.PRIVATE_DISCORD_BOT_TOKEN}`
};

exports.handler = async (event, context) => {
    const url = `https://discord.com/api/v10/applications/${process.env.PRIVATE_DISCORD_ID}/commands`;
    var getDLPayload =
    {
        name: "getlink",
        type: 1,
        description: 'Process a link to a video and tries to return the raw video download link',
        options: [
            {
                "name": "url",
                "description": "The URL where the video is located",
                "type": 3,
                "required": true,
                "max_length": 6000
            }
        ]
    };
    var results = await Promise.all(
        [
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": discordHeaders.Authorization
                },
                body: JSON.stringify(getDLPayload),
            })
        ]);
    return res.json(results.map(async r => await r.json()));
};