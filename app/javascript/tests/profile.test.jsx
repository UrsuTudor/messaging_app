import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Profile from "../components/Profile";

describe("Profile page tests:", () => {
  describe("when the logged user tries to view the profile of a different user", () => {
    beforeEach(() => {
      const mockUser = {
        name: "Mock Name",
        uuid: "123",
        description: "I'm a fake user.",
      };

      const mockLoggedUser = {
        uuid: "234",
      };

      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        if (selector === 'meta[name="csrf-token"]') {
          return {
            getAttribute: () => "mock-csrf-token",
          };
        }
        return null;
      });

      render(<Profile loggedUser={mockLoggedUser} user={mockUser} />);
    });

    it("renders user data", () => {
      const name = screen.getByText("Mock Name");
      const description = screen.getByText("I'm a fake user.");
      const avatar = screen.getByRole("img");

      expect(name).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(avatar).toBeInTheDocument();
    });

    it("does not render the description and avatar change forms", () => {
      const descrForm = screen.queryByLabelText("Change description");
      const avatarForm = screen.queryByLabelText("Change profile picture");

      expect(descrForm).toBe(null);
      expect(avatarForm).toBe(null);
    });
  });

  describe("when the logged user tries to view their own profile", () => {
    beforeEach(() => {
      const mockUser = {
        name: "Mock Name",
        uuid: "234",
        description: "I'm a fake user.",
      };

      const mockLoggedUser = {
        uuid: "234",
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ your: "data" }),
        })
      );

      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        if (selector === 'meta[name="csrf-token"]') {
          return {
            getAttribute: () => "mock-csrf-token",
          };
        }
        return null;
      });

      render(<Profile loggedUser={mockLoggedUser} user={mockUser} getLoggedUser={jest.fn()} />);
    });

    it("renders user data", () => {
      const name = screen.getByText("Mock Name");
      const description = screen.getByText("I'm a fake user.");
      const avatar = screen.getByRole("img", { name: /profile picture/i });

      expect(name).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(avatar).toBeInTheDocument();
    });

    it("renders the description and avatar change forms", () => {
      const descrForm = screen.getByText("Change description");
      const avatarForm = screen.getByText("Change profile picture");

      expect(descrForm).toBeInTheDocument();
      expect(avatarForm).toBeInTheDocument();
    });

    it("displays description feedback on update", async () => {
      const user = userEvent.setup();
      const descriptionFormRevealBtn = screen.getByText("Change description");
      await user.click(descriptionFormRevealBtn);

      const updateDescrBtn = screen.getByText("Update description");
      await user.click(updateDescrBtn);

      const descrFeedback = screen.getByText(/Your description has been updated successfully!/i);
      expect(descrFeedback).toBeInTheDocument();
    });

    describe("avatar feedback tests", () => {
      const setupAvatarChange = async ({ file } = {}) => {
        const user = userEvent.setup();

        const avatarBtn = screen.getByText("Change profile picture");
        await user.click(avatarBtn);

        if (file) {
          const input = screen.getByLabelText("Upload File");
          await user.upload(input, file);
        }

        const updateAvatarBtn = screen.getByText("Update profile picture");
        await user.click(updateAvatarBtn);

        return { user };
      };

      it("displays avatar feedback on update", async () => {
        const file = new File(["hello"], "hello.png", { type: "image/png" });

        await setupAvatarChange({ file });

        const avatarFeedback = screen.getByText(/Your profile picture has been updated successfully!/i);
        expect(avatarFeedback).toBeInTheDocument();
      });

      it("displays avatar feedback on missing file", async () => {
        await setupAvatarChange();

        const avatarFeedback = screen.getByText(/Please upload a valid image type/i);
        expect(avatarFeedback).toBeInTheDocument();
      });

      it("displays avatar feedback on wrong file type", async () => {
        const file = new File(["hello"], "hello.gif", { type: "image/gif" });
        await setupAvatarChange({file});

        const avatarFeedback = screen.getByText(/Please upload a valid image type/i);
        expect(avatarFeedback).toBeInTheDocument();
      });

      it("displays avatar feedback on wrong file size", async () => {
        const file = new File(["hello"], "hello.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 5 * 2048 * 2048 });

        await setupAvatarChange({ file });

        const avatarFeedback = screen.getByText(/Please upload an image that is under 5MB in size./i);
        expect(avatarFeedback).toBeInTheDocument();
      });
    });
  });
});
