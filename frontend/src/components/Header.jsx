import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">📸 Image Cropper</h1>
      </div>
      
      <nav className="header-nav">
        <Link to="/" className="header-link">Cropper</Link>
        <Link to="/config" className="header-link">Logo Config</Link>
      </nav>

      <div className="header-auth">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="header-auth-button header-login-button">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;