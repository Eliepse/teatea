# App Authentication

This document describe how the authentication is done on the app.

## JWT for Client-side

Users on the client-side PWA are authenticated through JWT. There are two tokens:

- `Access token`: to verify the user is authenticated on every request, passed as a Bearer token. This token has a short
  lifetime
- `Refresh token`: used to refresh the access token and keep the user logged between visits of the app, its lifetime is
  way longer than the `Access token`.

## Passwordless login

To authenticate, members don't need a password. This provide a smoother experience without the need to remember a
complicated password, and can increase the security as it prevents users from choosing a bad password.

> **Is passwordless a security risk?**<br/>
> Usually, when registering somewhere users provide a email and a password. If they don't remember their password, they
> request to change it. The application send email with a reset link to their mailbox. Then users can change their it.
>
> This means the mailbox is the weak link. If a hacker gain access to this mailbox, he can log into any service by
> resetting the password of the user associated to the email. Then, what's the point of having a password? It simply
> just add friction in most cases!

### Login steps:

1. User provide the email
2. The service replies with a inactive `OTP token`
3. The service sends an email with a link including the `challenge token`
4. The user click the link in the email
5. The service validates the `challenge token`
6. The service validate the `OTP token`
7. The user retry to log in with the `OTP token` (client-size app tries automatically)
8. The service reply with the appropriate `JWT tokens`
9. Both tokens are deleted (OTP and challenge)

### Considerations

- The `OTP token` must be stored on the device's local storage for security.
- Only one device per `OTP token` must be authenticated
- `OTP token` and `Challenge token` must be deleted once used
- `OTP token` and `Challenge token` must have a short TTL
- `OTP token` can have a longer TTL than the `Challenge token`
- User can require a new `Challenge token` for the same unexpired `OTP token`
- `Challenge token` requests must be rate limited
- `OTP token` requests must be rate limited
- A `Challenge token` must be associated to only one `OTP token`
