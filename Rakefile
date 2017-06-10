PEGJS = "pegjs"
task :default => :exe

desc "Compile grammar.pegjs"
task :compile do
  sh "#{PEGJS} -o ./public/app/grammar/grammar.js ./grammar/grammar.pegjs"
end

desc "rm ./public/app/grammar/grammar.js"
task :clean do
  sh "rm ./public/app/grammar/grammar.js"
end
