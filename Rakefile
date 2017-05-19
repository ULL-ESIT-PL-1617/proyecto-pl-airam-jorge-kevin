PEGJS = "pegjs"
task :default => :exe

desc "Compile grammar.pegjs"
task :compile do
  sh "#{PEGJS} -o ./public/grammar.js ./grammar/grammar.pegjs"
end

desc "rm ./public/grammar.js"
task :clean do
  sh "rm ./public/grammar.js"
end
