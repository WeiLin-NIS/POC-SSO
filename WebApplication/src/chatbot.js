import {chatbotConfig} from "./authConfig";

export async function callChatbotConfig(chatbotPrompts,accessToken) {
    const headers = new Headers();
    const bearer  = `Bearer ${accessToken}`;
    console.log(`token: ${bearer}`);

    headers.append("Authorization",bearer);
    const options = {
        method: "GET",
        headers: headers,
    }

    return fetch(chatbotConfig.chatBotEndpoint,options)
    .then(response => response.json())
    .catch(error => console.error(error));
}