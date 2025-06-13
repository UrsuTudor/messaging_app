import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import NavBar from "../components/NavBar";
import userEvent from "@testing-library/user-event";

describe("Navbar tests:", () => {
  it("renders profile button if the user is not on a profile page", () => {
    render(<NavBar loggedUser={{name: "Fake user"}} profileDisplay={false}/>)

    expect(screen.getByText("Fake user")).toBeInTheDocument()
  })

  it("renders home button if the user is on a profile page", () => {
    render(<NavBar profileDisplay={true}/>)

    expect(screen.getByText("Home")).toBeInTheDocument()
  })

  it("renders the log out button and calls the method", async () => {
    const mockSignOut = jest.fn()
    render(<NavBar signOut={mockSignOut} />)

    const user = userEvent.setup()
    await user.click(screen.getByText("Log Out"))
    expect(mockSignOut).toHaveBeenCalled()
  })
})
