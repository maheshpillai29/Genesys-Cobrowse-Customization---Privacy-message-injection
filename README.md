![image](https://github.com/user-attachments/assets/94f0a97f-b48b-4b27-b92d-b60ac91ae028)# Genesys-Cobrowse-Customization---Privacy-message-injection
Example showing the injection of privacy notice message in chat automatically when the agent initiates a cobrowse session.

This document provides a solution to automatically inject a privacy notice message into a chat session when an agent initiates a CoBrowse session in Genesys Cloud. Although there is no native feature for this functionality, it can be achieved by combining Genesys APIs and event subscriptions.

---

## **Problem Overview**

Genesys Cloud Messenger/Chat is a JavaScript plugin embedded inside a website. When the webpage loads, it automatically establishes a connection with Genesys and, upon user engagement, creates a chat session. With such native architecture, it doesn’t have any straightforward approach to send/receive messages programmatically.

---

## **Solution**

With the help of Genesys Cloud subscriptions, client apps can listen to the events happening in Genesys for the established session. One such subscription event is the `MessagingService.messagesReceived`, which a client app can subscribe to, and Genesys will send a notification to the callback handler when a message is sent/received for the session.

When a CoBrowse session is initiated by the agent, Genesys will send an event of type `CoBrowse` to the subscribed event handler. Based on this, the client app can send a notification to a backend service, which will use a combination of Genesys APIs to identify the conversation and inject the privacy message into the chat.

![image](https://github.com/user-attachments/assets/862d6c70-acdf-4e54-8d0c-824179298bf0)


## **Steps**

### **Frontend Implementation**

1. **Subscribe to Genesys Event**  
   Subscribe to the `MessagingService.messagesReceived` event.

2. **Detect CoBrowse Event**  
   Check if the incoming event is of type `CoBrowse`, the direction is `Outbound`, and the CoBrowse type is `Offering` to identify if the event is related to an agent offering CoBrowse.

3. **Send Post Request to Backend**  
   Extract the `Message ID` from the event payload and send it as a query parameter to the backend service.

```javascript
<script>
    // Step 1: Subscribe to conversation
    Genesys("subscribe", "MessagingService.messagesReceived", function (o) {
        try {
            // Step 2: Receive a callback event on all incoming/outgoing messages
            console.log('Message received');
            console.log('Message - ' + JSON.stringify(o));
            if (o.data.messages[0].direction === "Outbound" && 
                o.data.messages[0].events[0].eventType === "CoBrowse" && 
                o.data.messages[0].events[0].coBrowse.type === "Offering") {
                console.log('CoBrowse Event Detected');
                const messageId = o.data.messages[0].id; // Get Message ID from event payload
                // Step 3: Send a post request to backend service
                fetch(`http://localhost:1337/privacy?messageId=${messageId}`)
                    .then((response) => response.json())
                    .then((data) => console.log(data));
            }
        } catch (err) {
            console.error(err);
        }
    });
</script>
```

4. **Backend service app implementation** 
Backend service app will require an access token generated using OAuth credentials of grant type “Client Credentials“ in order to authenticate itself while making the API calls. Client ID and Secret key will be generated and shared by Genesys admin, which needs to be used to generate access token through the API

Reference API name in Collection - “Create Access Token (Client Credentials)”

Genesys Reference Documentation - https://developer.genesys.cloud/authorization/platform-auth/use-client-credentials

5. **Get Conversation ID by MessageID** 
The send message API of Genesys requires the “toAddress” and “fromAddress” in order to send a message through API. This needs to be obtained through a two step process. First, using the message ID(received as a parameter from client app) we need to get the “conversation ID” associated with it

Reference API name in Collection - “Get Conversation ID my Message ID”

6. **Get toAddress and fromAddress by ConversationID**
Once the “conversation ID” is available, we need to get the “toAddress” and “fromAddress” associated with conversation ID

Reference API name in Collection - “Get toAddress and fromAddress by Conversation ID”

7. **Send Message**
Once both “toAddress” and “fromAddress” is available, send message API needs to be called along with these addresses and the privacy message
Reference API name in Collection - “Send Agentless Outbound”

8. **Injection**
Genesys Cloud will now inject the privacy message in the given conversation


## **Code References and samples:**

Genesys API.postman_collection.json - Postman collection of all the required Genesys REST endpoint samples of the above mentioned APIs

Open Genesys API.postman_collection.json
Backend Service NodeJS code - Genesys provides SDKs for all the above mentioned REST endpoints and the same can be achieved through SDKs. This sample NodeJS express module is built using the SDK instead of the API. But both method server the same purpose.
Open Backend Service_sample.js


Sample HTML Page embedded with Genesys Chat messenger plugin
Open CoBrowse_Client_Example.ejs
