if Rails.env.development? && ENV["USE_TEST_DB"] == "true"
  ActiveRecord::Base.establish_connection(:test)
  puts "⚠️ Running development server with TEST database"
end
