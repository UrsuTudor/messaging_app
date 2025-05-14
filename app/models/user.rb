class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  before_create :assign_uuid
  has_one_attached :avatar
  validates :name, presence: true

  private

  def assign_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
