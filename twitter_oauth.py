#!/usr/bin/env python3
"""
Twitter OAuth 2.0 Access Token Generator

This script helps you complete the OAuth 2.0 flow to get access tokens
for your Twitter app. You'll need your Client ID and Client Secret.

Run this script and follow the prompts to authorize your app.
"""

import tweepy
import os

def main():
    # Get client id and secret from user
    client_id = input("Enter your Twitter Client ID: ").strip()
    client_secret = input("Enter your Twitter Client Secret: ").strip()

    # Create OAuth 2.0 handler
    oauth2 = tweepy.OAuth2UserHandler(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri="https://cyberpath-hq.com",  # Your callback URL
        scope=["tweet.write", "tweet.read", "users.read"],  # Scopes for posting tweets
    )

    try:
        # Get authorization URL
        print("\nGenerating authorization URL...")
        auth_url = oauth2.get_authorization_url()
        print(f"\nPlease visit this URL to authorize the app: {auth_url}")
        print("\nAfter authorizing, copy the FULL callback URL (the complete URL you were redirected to).")

        # Get authorization response URL from user
        auth_response = input("\nEnter the full callback URL: ").strip()

        # Exchange code for tokens
        print("\nExchanging code for access token...")
        access_token = oauth2.fetch_token(auth_response)

        # Print the token
        print("\n✅ OAuth 2.0 flow completed successfully!")
        print(f"Access Token: {access_token['access_token']}")
        print(f"Refresh Token: {access_token.get('refresh_token', 'None')}")
        print("\nAdd this to your GitHub repository secrets:")
        print("- TWITTER_ACCESS_TOKEN (use the access token above)")
        print("\nNote: OAuth 2.0 access tokens expire. You may need to refresh them periodically.")
        print("For production use, implement token refresh logic.")

    except Exception as e:
        print(f"❌ Error during OAuth 2.0 flow: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())