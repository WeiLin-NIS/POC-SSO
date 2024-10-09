import React, { useEffect, useState } from 'react';
// import ChatBot from "react-chatbot-kit";

import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { callMsGraph } from './graph';
import { ProfileData } from './components/ProfileData';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import './App.css';
import Button from 'react-bootstrap/Button';
import ChatbotEmbed from './EmbededChatbot';





const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);

    const [token, setToken] = useState("")

    useEffect(() => {
        RequestProfileData();
    }, []);

    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                callMsGraph(response.accessToken).then((response) => setGraphData(response));
                setToken(response.idToken)
                localStorage.setItem('reservedT', response.idToken)
            });
    }

    return (
        <>
            <h5 className="profileContent">Welcome {accounts[0].name}</h5>
            {/* {graphData ? (
                <ProfileData graphData={graphData} />
            ) : ( */}
            {/* // <Button variant="secondary"  >
                //     Request Profile
                // </Button> */}
            {token && <ChatbotEmbed token={token} />}

            {/* )} */}

        </>
    );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    return (

        <PageLayout>
            <MainContent />
        </PageLayout>
    );
}
