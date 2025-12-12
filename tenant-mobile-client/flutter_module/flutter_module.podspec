Pod::Spec.new do |s|
  s.name             = 'flutter_module'
  s.version          = '0.0.1'
  s.summary          = 'Flutter Tenant Mobile Module'
  s.description      = 'Flutter module for tenant mobile app'
  s.homepage         = 'https://github.com/yourusername/project'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Your Company' => 'email@example.com' }
  s.source           = { :path => '.' }
  s.public_header_files = 'ios/Runner/**/*.h'
  s.source_files = 'ios/Runner/**/*.{h,m,swift}'
  s.platform = :ios, '13.0'
  s.dependency 'Flutter'
end
