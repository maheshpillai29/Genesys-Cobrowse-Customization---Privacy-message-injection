
const { response } = require("express");
const express = require("express")
var genesysSDK = require('../GenesysUS_Demo/js/Genesys');
const app = express()
app.set('view engine', 'ejs')

app.get("/privacy", (req, res) => {
    //setTimeout(() => {  console.log("World!");
    const platformClient = require('purecloud-platform-client-v2');
    const client = platformClient.ApiClient.instance;
    const fetch = require;
    var CLIENT_ID = "<CLIENT_ID>";
    var CLIENT_SECRET = "<CLIENT_SECRET>";
    var ORG_REGION = "mypurecloud.com.au"; // eg. us_east_1
    client.setEnvironment(ORG_REGION);
    //const websocketClient = new WebSocketClient();
    //const notificationsApi = new platformClient.NotificationsApi();
    const conversationsApi = new platformClient.ConversationsApi();
    
    PRIVACY_MESSAGE="You are about to share your view of this website with a News Corp Australia Customer Support Person during this web chat or call. We're always keen to improve our service so all screen share sessions are monitored and recorded for training, compliance and security purposes. Any personal information you provide, or we collect, during this recording, is subject to our privacy policy. The full policy can be found [here](https://preferences.news.com.au/privacy)"
    client.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
        .then((authData) => {
            if (authData.accessToken != "" || authData.accessToken != null) {
                console.log("access token is-" + authData.accessToken);
                newToken = authData.accessToken;
                console.log("Token-" + newToken);
                messageId=req.query.messageId;
                conversationsApi.getConversationsMessageDetails(messageId).then((messageData) => {
                    //console.log("Data-"+JSON.stringify(conversationData))
                    console.log("convID - " + messageData.conversationId)
                    conversationId = messageData.conversationId;
                    conversationsApi.getConversationsMessage(conversationId)
                        .then((conversationDetails) => {
                            //console.log(`postConversationsMessagesAgentless success! data: ${JSON.stringify(conversationDetails, null, 2)}`);
                            console.log("convID - " + messageData.conversationId);
                            conversationDetails.participants.forEach(participant => {
                                if (participant.purpose = "acd") {
                                    fromAddress = participant.fromAddress.addressNormalized;
                                    toAddress = participant.toAddress.addressNormalized;
                                }
                            });
                            body = {
                                "fromAddress": fromAddress,
                                "toAddress": toAddress,
                                "toAddressMessengerType": "open",
                                "textBody": PRIVACY_MESSAGE,
                                "messagingTemplate": {
                                    "responseId": "",
                                    "parameters": [
                                        {
                                            "id": "",
                                            "value": ""
                                        }
                                    ]
                                },
                                "useExistingActiveConversation": true
                            }
                            conversationsApi.postConversationsMessagesAgentless(body)
                                .then((data) => {
                                    console.log(`postConversationsMessagesAgentless success! data: ${JSON.stringify(data, null, 2)}`);
                                }).catch(err => {
                                    console.log(err)
                                });

                        }).catch(err => {
                            console.log(err)
                        });

                }).catch(err => {
                    console.log(err)
                });
            } else {

            }
        }).catch(err => {
            console.log(err)
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"resCode":"Done"}));
    //}, 5000);
})
app.listen(1337) 