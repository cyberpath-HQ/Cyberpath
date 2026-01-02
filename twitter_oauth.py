#!/usr/bin/env python3
"""
Twitter OAuth 1.0 Access Token Generator

This script helps you complete the OAuth flow to get access tokens
for your Twitter app. You'll need your Consumer Key and Consumer Secret.

Run this script and follow the prompts to authorize your app.
"""

import tweepy
import os

def main():
    # Get consumer key and secret from user
    consumer_key = input("Enter your Twitter Consumer Key (API Key): ").strip()
    consumer_secret = input("Enter your Twitter Consumer Secret (API Secret): ").strip()

    # Create OAuth handler
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)

    try:
        # Get request token
        print("\nGetting request token...")
        auth_url = auth.get_authorization_url()
        print(f"\nPlease visit this URL to authorize the app: {auth_url}")
        print("\nAfter authorizing, copy the full callback URL and paste the 'oauth_verifier' parameter value.")

        # Get verifier from user
        verifier = input("\nEnter the oauth_verifier from the callback URL: ").strip()

        # Get access token
        print("\nGetting access token...")
        auth.get_access_token(verifier)

        # Print the tokens
        print("\n✅ OAuth flow completed successfully!")
        print(f"Access Token: {auth.access_token}")
        print(f"Access Token Secret: {auth.access_token_secret}")
        print("\nAdd these to your GitHub repository secrets:")
        print("- TWITTER_ACCESS_TOKEN")
        print("- TWITTER_ACCESS_SECRET")

    except Exception as e:
        print(f"❌ Error during OAuth flow: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())