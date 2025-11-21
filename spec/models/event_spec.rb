require "rails_helper"

RSpec.describe Event, type: :model do
  describe "#validate_cover_image" do
    let(:user1) { create(:user) }
    let(:event) { build(:event, title: "Test Event", organisers: [ user1 ]) }

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
      large_data = "0" * (6 * 1024 * 1024)
      event.cover_image.attach(
        io: StringIO.new(large_data),
        filename: "large.jpg",
        content_type: "image/jpeg"
      )

      event.validate
      expect(event.errors[:cover_image]).to include(
        "Image size is too large. The avatar needs to be under 5 MB in size."
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
end
