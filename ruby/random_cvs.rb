require "csv"
require "fileutils"

original_csv = CSV.open("data/educational-technology.csv")

rand = Random.new

filename = "data/edu5.csv"

FileUtils.copy_file("data/educational-technology.csv", filename)
  CSV.open(filename, "w") do |row|
    original_csv.each do |row_original|
    row_original[3] = rand.rand(-0.0203708651539833..3.01167247378138)
    row_original[4] = rand.rand(-0.0938560665890485..2.72905460862683)
    row << row_original
  end
end
