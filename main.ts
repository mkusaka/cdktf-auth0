import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import * as auth0 from "./.gen/providers/auth0";
import * as dotenv from "dotenv";

dotenv.config();

class MyAuth0Stack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const provider = new auth0.provider.Auth0Provider(this, "auth0", {
      domain: process.env.AUTH0_DOMAIN || "",
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      debug: true,
    });

    // new auth0.user.User(this, "user", {
    //   connectionName: "Username-Password-Authentication",
    //   email: "hinoshita1992@gmail.com",
    //   password: "Password12345&",
    // })

    const client = new auth0.client.Client(this, "client", {
      name: "Example Client",
      description: "Example Client Description",
      appType: "regular_web",
      callbacks: ["http://localhost:3000/callback"],
      allowedOrigins: ["http://localhost:3000"],
      oidcConformant: true,
      jwtConfiguration: {
        alg: "RS256",
      },
      provider,
    });

    new auth0.clientCredentials.ClientCredentials(this, "clientCredentials", {
      clientId: client.clientId,
      authenticationMethod: "client_secret_post",
      provider,
    });

    const myAppClient = new auth0.client.Client(this, "myAppClient", {
      name: "My App",
      appType: "non_interactive",
      allowedClients: [],
      allowedLogoutUrls: [],
      provider,
    });
    new auth0.clientCredentials.ClientCredentials(
      this,
      "myAppClientCredentials",
      {
        clientId: myAppClient.clientId,
        authenticationMethod: "client_secret_post",
        provider,
      },
    );
  }
}

const app = new App();
new MyAuth0Stack(app, "cdktf-auth0");
app.synth();
