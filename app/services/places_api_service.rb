class PlacesApiService
  BASE_URL = "https://places.googleapis.com/v1/places:searchText"

  def initialize(api_key: ENV["PLACES_API_KEY"])
    @api_key = api_key
  end

   def search(text)
    response = HTTParty.post(
      BASE_URL,
      headers: headers,
      body: { textQuery: text }.to_json
    )

    # normalized for simplicity on the frontend
    return [{ name: "No location found", id: "fakekey" }] unless response["places"]

    response["places"].map do |location|
      {
        name: "#{location["displayName"]["text"]}, #{location["formattedAddress"]}",
        id: location["id"]
      }
    end
  end

  private

  def headers
    {
      "Content-Type" => "application/json",
      "X-Goog-Api-Key" => @api_key,
      "X-Goog-FieldMask" => "places.displayName,places.formattedAddress,places.id"
    }
  end
end
