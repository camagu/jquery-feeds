#!/usr/bin/env ruby

# Taken from https://gist.github.com/2967061

# checkout the readme from the master branch
# `git merge master`

readme_path = "README.md"
index_path = "index.md"

# write the index readme file
File.open readme_path, "r" do |readme|
  File.open index_path, "w" do |index|

    # write the jekyll front matter
    index.puts "---"
    index.puts "title: Documentation"
    index.puts "class: docs"
    index.puts "layout: default"
    index.puts "---"

    readme.readlines.each do |line|
      
      # convert backticks to liquid
      %w(bash ruby html javascript).each do |lang|
        line.gsub!("```#{lang}", "{% highlight #{lang} %}")
      end
      line.gsub!("```", "{% endhighlight %}")

      # convert headers so they are linkable
      # if line =~ /^#+/
        # leader = line[0, line.index(/\s/)]
        # text = line[line.index(/\s./)..-1].strip
        # line = "#{leader} #{text} {##{text.downcase.gsub(/\s/, "-")}}"
      # end

      index.puts line
    end
  end
end