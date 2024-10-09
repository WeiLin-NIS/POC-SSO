import azure.functions as func
import logging
import requests
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="helloworld")
def helloworld(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )
    
@app.function_name(name="prediction")
@app.route(route="api/v1/prediction/{flowid}",methods=[func.HttpMethod.POST])
def prediction(req: func.HttpRequest) -> func.HttpResponse:
    
    FLOWISE_SERVER_ADDRESS = "https://flowise-v1py.onrender.com/api/v1/prediction"
    logging.info('Processing a request.')

    try:
        flow_id=req.route_params.get("flowid")
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            "Invalid JSON input",
            status_code=400
        )

    # re-direct the api to actual flowise server to execute the query
    header = {
        "Authorization": "Bearer UG9e2kYdI0AF4Ii0oNpgaHqny5Z0C6PhW6TAqX-5JKA"
    }
    response = requests.post(f"{FLOWISE_SERVER_ADDRESS}/{flow_id}", headers=header, json=req_body)
    result = response.json()

    return func.HttpResponse(
        json.dumps(result),
        mimetype="application/json",
        status_code=200
    )