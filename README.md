# Set up Function App and API management

# Set up Function App

1. clone repo
2. Environment configuration
    - node.js
    - vs code, necessary plugins including
        - azure Function app
        - azurite
        - Core Tools
3. in VSCode, press F1 and choose “ **Azure Functions: Create Function App in Azure**.”
    1. name: poc-sso
    2. hosting plan: Consumption
    3. location: East US
    4. runtime: python 3.11
    5. resource group: ai-platform
    6. storage account: pocsso
    7. Application Insight: skip for now
    
    ![image.png](readme/image.png)
    
4. in vs code, open folder “POC-SSO\AzureResource\FunctionApp_SSO”
    
    ![image.png](readme/image1.png)
    
5. to test, login to Azure portal and then go to Function App “poc-sso”, 
    1. you need to enable CORS in order to test in the azure portalgo to API > CORS,   enable 
        
        ![image.png](readme/image2.png)
        
    2. in the “Overview”, click the testing Function “helloworld” and go to its detail page
        1. find the button “Test/Run” and add one query parameter name:wei
        2. click Run and you should see reponse code 200

Reference:

[https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-python](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-python)

# Set up API management

1. go to azure portal and create API management “poc-sso”,  

![image.png](readme/image3.png)

1. Click Review + create, and wait for it to be activated, it takes around 30-45 minutes to finish activation
2. once activated, click Add API and choose “Function App” as source
3. In the page, click the select button and choose poc-sso, we don’t need function helloworld so skip import this one.

    
    ![image.png](readme/image5.png)
    
4. change the Name and display Name to “prediction” and then remove suffix and click “create”
5. API management could integrate with Azure Entra ID and verify jwt token provided by Azure Entra ID, to do that, add a Inbound processing policy “verify jwt”,  open the policy code eidtor and replace it with 

    
    ```jsx
    <policies>
        <inbound>
            <base />
            <set-backend-service id="apim-generated-policy" backend-id="poc-sso" />
            <validate-jwt header-name="Authorization" failed-validation-httpcode="401" require-scheme="Bearer" output-token-variable-name="jwt">
                <openid-config url="https://login.microsoftonline.com/3c65fa17-1a6c-4159-9a2d-b6eba740a8f7/v2.0/.well-known/openid-configuration" />
                <audiences>
                    <audience>71f772ed-a1de-4585-8fdb-c8a7d181232b</audience>
                </audiences>
                <issuers>
                    <issuer>https://login.microsoftonline.com/5ea178fd-9ff4-40f6-8bf2-8481ead25b37/v2.0</issuer>
                </issuers>
            </validate-jwt>
            <cors allow-credentials="false">
                <allowed-origins>
                    <origin>*</origin>
                </allowed-origins>
                <allowed-methods>
                    <method>GET</method>
                    <method>POST</method>
                </allowed-methods>
                <allowed-headers>
                    <header>*</header>
                </allowed-headers>
            </cors>
        </inbound>
        <backend>
            <base />
        </backend>
        <outbound>
            <base />
        </outbound>
        <on-error>
            <base />
        </on-error>
    </policies>
    ```
    
6. click save 
7. disable subscription key since we’ve already use single sign on to do verification 
    
    ![image.png](readme/image4.png)
    
8. test it with 
    
    ```jsx
    flowid: 41d00239-dcd0-4b61-aa84-9d477bad26ea
    
    Header:
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1jN2wzSXo5M2c3dXdnTmVFbW13X1dZR1BrbyJ9.eyJhdWQiOiI3MWY3NzJlZC1hMWRlLTQ1ODUtOGZkYi1jOGE3ZDE4MTIzMmIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNWVhMTc4ZmQtOWZmNC00MGY2LThiZjItODQ4MWVhZDI1YjM3L3YyLjAiLCJpYXQiOjE3Mjg1MDIxMDAsIm5iZiI6MTcyODUwMjEwMCwiZXhwIjoxNzI4NTA2MDAwLCJhaW8iOiJBV1FBbS84WUFBQUF3c0YySU15RE8wTmpCdmhDU3Aybmk1bzlnSlhRQWRORkRhRWtCSHQ1dDJ3TTg1dHdGam8zeWtPYlZrcy96OHlmLzRvSllwRmpPODF5R012L1poTFIzcXVaVzc0aUdUOHVxaExIN1cxTGdqQ2FCWVNPQVQ2Y3hYMXJlWHN4UUZIZyIsIm5hbWUiOiJXZWkgTGluIiwibm9uY2UiOiI2MWE0NzFmNS03Mzc2LTRiNWEtYjhiYS01YWVlZmQzY2MzMjQiLCJvaWQiOiJhMDJlNDg5Mi0wNGJkLTQxODQtYjBmZi00Mzc1NGU2YzkzZGEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ3ZWkubGluQG53LWl0cy5jb20iLCJyaCI6IjAuQVZzQV9YaWhYdlNmOWtDTDhvU0I2dEpiTi0xeTkzSGVvWVZGajl2SXA5R0JJeXY1QU8wLiIsInN1YiI6Im1XcHA1dTRUU0ZXWFYtVjBYLTVwdmFfeEVldlVkd293Y3llVkxwVi11Z1kiLCJ0aWQiOiI1ZWExNzhmZC05ZmY0LTQwZjYtOGJmMi04NDgxZWFkMjViMzciLCJ1dGkiOiJvUU9ObDRSUmJrcXZvLWpLU0N1NEFBIiwidmVyIjoiMi4wIn0.mUiSlxJEeRhQw3wcf6cOamDeZyfuHVp5J4NG3idrnwb4adgTlxo6CDLY3u03Pd4lkidSNUPBOoK1-r8_rJkmAGP9bybxC6jy2XU3mN7fGRtSiSrrhg5E0XwD6pLUwLfxPKeUZlcFuH8W9Cp68Ldm6bfjivic7PzYtnVSGYWyM-17kIAyViFTISxvh-xQoF0LojSXDlV8cMQhuow05qe7hMw9Ie2rZtsovgrWqdZj8OLjaXjYqXKG_XTzrxddvs_4isSNjW3sPR4XDEj48BD1gAHs0zyB8DoGiR1EkqKyO7LDowjB_fyMzaQkvpO6VRuNSlJK-233vOjtUDRNFOWP6A
    
    body:
    {
        "question": "who's CK"
    }
    ```
    

# Start Web Application

go to folder POC-SSO\WebApplication and run command

```jsx
npm install
npm start
```