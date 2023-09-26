export function getParameterValueFromLink(parameterName) {
    // Get the URL of the current page
    const url = window.location.href;
    console.log("url", url)

    // Parse the URL to extract the query parameters
    const queryString = url.split('?')[1];
    if (!queryString) {
        return null; // No query parameters found
    }

    // Split the query string into individual parameters
    const parameters = queryString.split('&');

    // Loop through the parameters to find the one with the matching name
    for (const parameter of parameters) {
        const [name, value] = parameter.split('=');
        if (name === parameterName) {
            return decodeURIComponent(value); // Return the parameter value
        }
    }

    return null; // Parameter not found
}
