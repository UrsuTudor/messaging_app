class Api::V1::HomepageController < ApplicationController
  before_action :authenticate_user!
  def index
  end
end
