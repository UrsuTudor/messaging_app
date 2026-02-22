require "rails_helper"

RSpec.describe Event, type: :model do
  let(:user1) { create(:user) }
  let(:event) { create(:event, title: "Test Event", organisers: [ user1 ]) }
  describe "#validate_cover_image" do
    it "adds an error about invalid type when the type of the file is wrong" do
      event.cover_image.attach(
        io: StringIO.new("fake"),
        filename: "file.txt",
        content_type: "text/plain"
      )

      event.validate
      expect(event.errors[:cover_image]).to include(
        "Not a valid image type. The avatar needs to be in jpeg/png format."
      )
    end

    it "adds an error about file size when the image is too large" do
      large_data = "0" * (16 * 1024 * 1024)
      event.cover_image.attach(
        io: StringIO.new(large_data),
        filename: "large.jpg",
        content_type: "image/jpeg"
      )

      event.validate
      expect(event.errors[:cover_image]).to include(
        "Image size is too large. The avatar needs to be under 15 MB in size."
      )
    end

    it "does not add any errors when a valid image type" do
      data = "0" * (1 * 1024 * 1024)
      event.cover_image.attach(
        io: StringIO.new(data),
        filename: "valid.jpg",
        content_type: "image/jpeg"
      )

      event.validate
      expect(event.errors[:cover_image]).to be_empty
    end
  end

  describe "returns organisers and participants correctly" do
    let(:user2) { create(:user, email: "test@mail.com") }
    let(:user3) { create(:user, email: "test2@mail.com") }
    let(:user4) { create(:user, email: "test3@mail.com") }

    it "doesn't return an organiser if the status is not accepted" do
      expect(event.organisers.count).to be(1)

      create(:event_membership, user: user2, event_id: event.id, role: "organiser", status: "pending")
      create(:event_membership, user: user3, event_id: event.id, role: "organiser", status: "rejected")
      create(:event_membership, user: user4, event_id: event.id, role: "organiser", status: "deleted")

      expect(event.organisers.count).to be(1)
    end

    it "doesn't return a participant if the status is not accepted" do
      expect(event.participants.count).to be(0)

      create(:event_membership, user: user2, event_id: event.id, role: "participant", status: "pending")
      create(:event_membership, user: user3, event_id: event.id, role: "participant", status: "rejected")
      create(:event_membership, user: user4, event_id: event.id, role: "participant", status: "deleted")

      expect(event.participants.count).to be(0)
    end
  end
end
