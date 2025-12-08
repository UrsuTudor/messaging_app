Rails.application.routes.draw do
  devise_for :users
  root "api/v1/homepage#index"

  namespace :api do
    namespace :v1 do
      post "chats/open", to: "chats#find_or_create"
      post "chats/update_read", to: "chats#update_read_status"
      post "chats/update", to: "chats#update"

      post "messages/send", to: "messages#create"

      get "users/list", to: "users#index"
      get "users/current", to: "users#current_user_info"
      post "users/update", to: "users#update"
      get "users/chats", to: "users#paginated_users_with_chat"
      get "users/group", to: "users#users_with_private_chat"

      get  "events/participants", to: "event_memberships#index"
      post "events/participate", to: "event_memberships#create"
      post "events/update_membership", to: "event_memberships#update"
      delete "events/leave_event", to: "event_memberships#destroy"

      get "events/all", to: "events#index"
      get "events/locations", to: "events#locations"
      get "events/:id", to: "events#show"
      post "events/create", to: "events#create"
      post "events/update", to: "events#update"
      delete "events/delete", to: "events#destroy"
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end

# take the group form and make it into a component; you are using taht same structure in groups chats, for organisers and for inviting organisers to events
# fetch the elements in the parent component and send them over together with the method that the form needs to call

# allow organisers to invite other organisers after the event has been created
# allow organisers to promote a participant to an organiser
