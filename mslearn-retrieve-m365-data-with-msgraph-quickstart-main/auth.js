//MSAL configuration
const msalConfig = {
  auth: {
    clientId: "96b60668-45f4-4c20-9402-f868520201f2",
    // comment out if you use a multi-tenant AAD app
    authority:
      "https://login.microsoftonline.com/d65b6567-29cc-4f9a-a699-7047acdd761d",
    redirectUri: "http://localhost:8080",
  },
};
const msalRequest = { scopes: [] };
function ensureScope(scope) {
  console.log(scope);
  sc = scope.split(",");
  console.log(sc);
  sc.forEach((scop) => {
    if (
      !msalRequest.scopes.some((s) => s.toLowerCase() === scop.toLowerCase())
    ) {
      msalRequest.scopes.push(scop);
    }
  });

  console.log(msalRequest);
}
//Initialize MSAL client
const msalClient = new msal.PublicClientApplication(msalConfig);

// Log the user in
async function signIn() {
  const authResult = await msalClient.loginPopup(msalRequest);
  sessionStorage.setItem("msalAccount", authResult.account.username);
}
//Get token from Graph
async function getToken() {
  let account = sessionStorage.getItem("msalAccount");
  if (!account) {
    throw new Error(
      "User info cleared from session. Please sign out and sign in again."
    );
  }
  try {
    // First, attempt to get the token silently
    const silentRequest = {
      scopes: msalRequest.scopes,
      account: msalClient.getAccountByUsername(account),
    };

    const silentResult = await msalClient.acquireTokenSilent(silentRequest);
    console.log(silentResult.accessToken);
    return silentResult.accessToken;
  } catch (silentError) {
    // If silent requests fails with InteractionRequiredAuthError,
    // attempt to get the token interactively
    if (silentError instanceof msal.InteractionRequiredAuthError) {
      const interactiveResult = await msalClient.acquireTokenPopup(msalRequest);
      return interactiveResult.accessToken;
    } else {
      throw silentError;
    }
  }
}
