class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  before_create :assign_uuid
  validates :name, presence: true, length: { maximum: 32 }
  validates :email, length: { maximum: 255 }
  validates :description, length: { maximum: 500 }
  validate :validate_avatar

  has_one_attached :avatar
  has_many :chat_memberships
  has_many :chats, through: :chat_memberships

  has_many :event_memberships
  has_many :events, -> { where(event_memberships: { status: [ "accepted" ] }) },  through: :event_memberships

  def validate_avatar
    return unless avatar.attached?

    valid_types = [ "image/jpeg", "image/png" ]
    max_size = 5 * 1024 * 1024

    errors.add(:avatar, "Not a valid image type. The avatar needs to be in jpeg/png format.") unless valid_types.include?(avatar.blob.content_type)

    errors.add(:avatar, "Image size is too large. The avatar needs to be under 5 MB in size.") unless avatar.blob.byte_size <= max_size
  end

  # returns a list of users that have a private chat with the user
  def users_with_private_chat(search_term = "")
    private_chats = chats 
        .joins(:users) 
        .group("chats.id") 
        .having("COUNT(users.id) = 2")
    
    users = User.joins(:chats)
        .where(chats: { id: private_chats.select(:id) })
        .where.not(id: self.id)

    unless search_term.blank?
      pattern = "%#{search_term}%"
      users = users.where(
        "users.name ILIKE :pattern OR chats.name ILIKE :pattern",
        pattern: pattern
      )
    end

    users
  end

  def users_without_private_chat(search_term = "")
    private_chats = chats 
      .joins(:users) 
      .group("chats.id") 
      .having("COUNT(users.id) = 2")
    
    users = User.left_outer_joins(:chats)
        .where("chats.id IS NULL OR chats.id NOT IN (?)", private_chats.select(:id))
        .where.not(id: self.id)
    
    unless search_term.blank?
      pattern = "%#{search_term}%"
      users = users.where(
        "users.name ILIKE :pattern",
        pattern: pattern
      )
    end

    users
  end

  # returns a list of chats, ordered by most recent messages
  def recent_chats(search_term = "")
    pattern = "%#{search_term}%"

    self.chats
      .left_joins(:messages, :users)
      .includes(:messages, :users)
      .where(
          "users.name ILIKE :pattern OR chats.name ILIKE :pattern",
          pattern: pattern
      )
      .group("chats.id")
      .order(Arel.sql("MAX(messages.created_at) DESC NULLS LAST"))
  end

  private

  def assign_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
