const {InteractionResponseFlags, InteractionResponseType} = require("discord-interactions");

export const getLink = async(opt)=>{
    const url = opt?.options[0]?.value ?? "";
    //const ids = idsString.split(";") ?? [];

    //var result = await fetch("https://wgr.vercel.app/api/sendid?ids=" + JSON.stringify(ids));
    //result = await result.json();

    return {
        type:4,
        data:{
            content: url ?? 'Failed', 
            flags: InteractionResponseFlags.EPHEMERAL            
        }
    }
}