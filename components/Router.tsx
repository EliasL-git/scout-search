import React from "react"
import PortalSDK from "@stacker/portal-sdk"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import NotFoundPage from "../pages/NotFoundPage"

export function Router() {
  const { currentPage } = PortalSDK.useRouter()

  switch (currentPage) {
    case "home":
    case undefined:
    case null:
    case "":
      return <HomePage />

    case "login":
      return <LoginPage />

    case "register":
      return <RegisterPage />

    default:
      return <NotFoundPage />
  }
}