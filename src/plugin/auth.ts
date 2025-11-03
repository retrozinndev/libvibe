import WebKit2 from "gi://WebKit2?version=4.1";


export namespace Auth {
    export type Entry = {
        /** template text for the entry, it's visible by the user. Examples: "E-mail", "Password" */
        text?: string;
        /** the id for the auth entry. this will be useful later to differ data between entries */
        id: any;
        /** false by default */
        optional?: boolean;
        /** content the user entered in the entry */
        content?: string;
    }

    export class AuthRejectedByUser extends Error {
        message: string = "The authorization credentials popup was rejected by the user";
        name: string = "Authorization Rejected by User";
    }

    export class AuthRejectedByPlugin extends Error {
        message: string = "The authorization credentials were rejected by the plugin";
        name: string = "Authorization Rejected by Plugin";
    }

    /** request a custom authorization popup(ask credentials) 
    *
    * @param entries the entries you want the user to fill
    *
    * @param approve function that approves the data filled by the user, like login checks. if
    * user does not pass, you can throw AuthRejectedByPlugin in the function.
    *
    * @throws AuthRejectedByUser when user rejects to authorize (canceling action)
    * */
    export async function requestAuthPopup(
        entries: Array<Auth.Entry>, 
        approve?: (entries: Array<Auth.Entry>) => Promise<void>
    ): Promise<Array<Auth.Entry>> {
        // TODO
        throw new Error("Function not implemented");
    }

    export async function requestWebviewAuth(authUrl: string): Promise<WebKit2.WebView> {
        throw new Error("Function not implemented");
    }
}
