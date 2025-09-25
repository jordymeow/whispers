export type IconCategoryMap = Record<string, readonly string[]>;

export const BASIC_ICON_CATEGORIES: IconCategoryMap = {
  'Night & Dreams': ['Moon', 'MoonStar', 'Sparkle', 'Sparkles', 'Star', 'CloudMoon', 'Zap'],
  'Weather & Nature': ['Cloud', 'CloudRain', 'CloudSnow', 'Sun', 'Wind', 'Rainbow', 'Snowflake', 'Trees', 'TreeDeciduous', 'Leaf', 'Flower', 'Bird', 'Mountain'],
  Emotions: ['Heart', 'HeartHandshake', 'Smile', 'Frown', 'Laugh', 'Angry'],
  Time: ['Clock', 'Timer', 'Watch', 'Hourglass', 'Calendar', 'CalendarDays'],
  Abstract: ['Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon', 'Diamond'],
} as const;

export const ADMIN_ICON_CATEGORIES: IconCategoryMap = {
  'Night & Dreams': ['Moon', 'MoonStar', 'Stars', 'Sparkles', 'Star', 'CloudMoon', 'Sparkle', 'BedDouble', 'CloudMoon'],
  'Love & Emotions': ['Heart', 'HeartHandshake', 'HeartCrack', 'HeartPulse', 'Smile', 'SmilePlus', 'Frown', 'Meh', 'Angry', 'Laugh'],
  'Thinking & Mind': ['Brain', 'BrainCircuit', 'BrainCog', 'Lightbulb', 'Eye', 'EyeOff', 'Zap', 'CircuitBoard', 'Cpu', 'Binary', 'Glasses'],
  'Life & Nature': ['Flower', 'Flower2', 'Trees', 'TreePalm', 'TreePine', 'TreeDeciduous', 'Leaf', 'Bird', 'Fish', 'Bug', 'Butterfly', 'Cat', 'Dog', 'Rabbit', 'Squirrel', 'Cherry', 'Apple', 'Carrot', 'Egg'],
  'Weather & Sky': ['Sun', 'Sunrise', 'Sunset', 'Cloud', 'CloudRain', 'CloudSnow', 'CloudLightning', 'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudMoon', 'CloudSun', 'Snowflake', 'Wind', 'Tornado', 'Rainbow', 'Umbrella', 'Thermometer', 'Waves'],
  'Sports & Activity': ['Activity', 'Bike', 'PersonStanding', 'Medal', 'Trophy', 'Target', 'Dumbbell', 'Footprints', 'Award', 'Swords', 'Gamepad2', 'Dice1', 'TentTree', 'Mountain', 'MountainSnow'],
  'People & Social': ['User', 'Users', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX', 'PersonStanding', 'Baby', 'Contact', 'UsersRound', 'HandMetal', 'HandHeart', 'Handshake'],
  'Movement & Travel': ['Footprints', 'Navigation', 'Navigation2', 'NavigationOff', 'MapPin', 'Map', 'Compass', 'Plane', 'Car', 'Ship', 'Train', 'Bus', 'Rocket', 'Anchor', 'Route', 'Move', 'Move3d', 'MoveRight', 'MoveLeft', 'MoveUp', 'MoveDown'],
  'Ideas & Creativity': ['Lightbulb', 'Palette', 'Brush', 'PaintBucket', 'PenTool', 'Pencil', 'PenSquare', 'Feather', 'Wand', 'Wand2', 'Sparkle', 'Paintbrush', 'Paintbrush2', 'Gem', 'Diamond'],
  Technology: ['Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Cpu', 'HardDrive', 'Wifi', 'WifiOff', 'Code', 'Terminal', 'Binary', 'Bug', 'GitBranch', 'Github', 'Globe', 'Database', 'Server', 'Cloud', 'CloudOff', 'Radio', 'Bluetooth', 'Battery', 'BatteryCharging'],
  'Music & Art': ['Music', 'Music2', 'Music3', 'Music4', 'Mic', 'MicOff', 'Headphones', 'Radio', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Piano', 'Guitar', 'Drum', 'Speaker', 'AudioLines', 'AudioWaveform'],
  'Writing & Books': ['Book', 'BookOpen', 'BookOpenCheck', 'Library', 'Newspaper', 'FileText', 'NotebookPen', 'NotebookText', 'ScrollText', 'Quote', 'PenSquare', 'Edit', 'Edit2', 'Edit3', 'Type', 'AlignLeft', 'AlignCenter', 'AlignRight'],
  'Time & Calendar': ['Clock', 'Clock1', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'Clock10', 'Clock11', 'Clock12', 'Timer', 'TimerReset', 'Hourglass', 'Calendar', 'CalendarDays', 'CalendarClock', 'CalendarCheck', 'Watch', 'AlarmClock', 'AlarmClockOff', 'Stopwatch'],
  Communication: ['MessageCircle', 'MessageSquare', 'MessagesSquare', 'Mail', 'MailOpen', 'Send', 'AtSign', 'Phone', 'PhoneCall', 'Video', 'VideoOff', 'Share', 'Share2', 'Reply', 'Forward', 'Bell', 'BellOff', 'BellRing'],
  'Food & Drink': ['Coffee', 'Beer', 'Wine', 'GlassWater', 'Milk', 'Pizza', 'Utensils', 'UtensilsCrossed', 'ChefHat', 'Cookie', 'Croissant', 'Apple', 'Cherry', 'Grape', 'Banana', 'Carrot', 'IceCream', 'IceCream2', 'Soup', 'Sandwich'],
  'Home & Places': ['Home', 'House', 'Building', 'Building2', 'Castle', 'School', 'Hospital', 'Store', 'Hotel', 'Warehouse', 'Factory', 'Church', 'Tent', 'TentTree', 'Lamp', 'Sofa', 'Bath', 'Bed', 'BedDouble', 'BedSingle'],
  Celebration: ['PartyPopper', 'Gift', 'Cake', 'Sparkles', 'Star', 'Award', 'Crown', 'Medal', 'Trophy', 'Gem', 'Diamond', 'Confetti', 'Ticket', 'BadgeCheck'],
  'Health & Wellness': ['Heart', 'HeartPulse', 'Activity', 'Stethoscope', 'Syringe', 'Pill', 'Thermometer', 'Hospital', 'Ambulance', 'CrossCircle', 'ShieldCheck', 'ShieldAlert'],
  'Work & Business': ['Briefcase', 'Presentation', 'TrendingUp', 'TrendingDown', 'BarChart', 'BarChart2', 'LineChart', 'PieChart', 'Calculator', 'Receipt', 'CreditCard', 'Wallet', 'DollarSign', 'Euro', 'PoundSterling', 'IndianRupee', 'Coins'],
  'Files & Documents': ['File', 'FileText', 'FilePlus', 'FileSearch', 'Files', 'Folder', 'FolderOpen', 'FolderPlus', 'Archive', 'Paperclip', 'Link', 'ExternalLink', 'Download', 'Upload', 'Save', 'Copy', 'Clipboard'],
  'Security & Privacy': ['Lock', 'Unlock', 'Key', 'Shield', 'ShieldAlert', 'ShieldCheck', 'ShieldOff', 'Eye', 'EyeOff', 'Fingerprint', 'ScanFace', 'UserCheck', 'UserX'],
  'Arrows & Navigation': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUpRight', 'ArrowUpLeft', 'ArrowDownRight', 'ArrowDownLeft', 'ChevronsUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight', 'RotateCw', 'RotateCcw', 'RefreshCw', 'RefreshCcw'],
  'Status & Alerts': ['Check', 'CheckCircle', 'X', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle', 'Ban', 'Flag', 'FlagOff', 'Bell', 'BellOff', 'BellRing'],
  'Media & Entertainment': ['Play', 'Pause', 'PlayCircle', 'PauseCircle', 'SkipForward', 'SkipBack', 'FastForward', 'Rewind', 'Tv', 'Tv2', 'Film', 'Camera', 'CameraOff', 'Image', 'Images', 'Video', 'VideoOff', 'Gamepad', 'Gamepad2'],
} as const;

export const ICON_SYNONYMS: Record<string, string[]> = {
  // Night & Dreams
  MoonStar: ['moon', 'night', 'dream', 'sleep', 'midnight', 'lunar', 'star', 'evening', 'bedtime', 'dark'],
  Moon: ['night', 'dark', 'lunar', 'sleep', 'evening', 'crescent'],
  Stars: ['constellation', 'night', 'sky', 'sparkle', 'twinkle', 'galaxy'],
  Sparkles: ['shine', 'glimmer', 'twinkle', 'magic', 'glitter', 'shimmer', 'gleam'],
  Star: ['favorite', 'rate', 'bookmark', 'special', 'achievement'],
  CloudMoon: ['night', 'weather', 'dream', 'cloudy', 'evening'],
  BedDouble: ['sleep', 'rest', 'bedroom', 'dream', 'night'],

  // Love & Emotions
  Heart: ['love', 'favorite', 'care', 'emotion', 'like', 'romance', 'affection', 'valentine', 'passion'],
  HeartHandshake: ['care', 'support', 'love', 'help', 'friendship', 'compassion'],
  HeartCrack: ['heartbreak', 'sad', 'broken', 'loss', 'grief'],
  HeartPulse: ['health', 'heartbeat', 'alive', 'medical', 'vitality'],
  Smile: ['happy', 'joy', 'emotion', 'face', 'positive', 'glad', 'cheerful'],
  Frown: ['sad', 'unhappy', 'emotion', 'face', 'disappointed'],
  Meh: ['neutral', 'indifferent', 'okay', 'so-so'],
  Angry: ['mad', 'upset', 'rage', 'furious', 'annoyed'],
  Laugh: ['lol', 'funny', 'humor', 'comedy', 'hilarious', 'joy'],

  // Thinking & Mind
  Brain: ['mind', 'think', 'thought', 'intelligence', 'smart', 'cognitive', 'mental', 'idea'],
  BrainCircuit: ['ai', 'artificial', 'intelligence', 'neural', 'tech', 'mind'],
  BrainCog: ['thinking', 'processing', 'cognitive', 'mental', 'gear'],
  Lightbulb: ['idea', 'bright', 'innovation', 'eureka', 'inspiration', 'creative', 'solution'],
  Eye: ['see', 'view', 'look', 'watch', 'observe', 'vision', 'sight'],
  EyeOff: ['hide', 'private', 'unseen', 'invisible', 'blind'],

  // Nature & Life
  Flower: ['bloom', 'nature', 'garden', 'spring', 'blossom', 'flora', 'petal', 'beautiful'],
  Flower2: ['tulip', 'nature', 'garden', 'bloom', 'spring'],
  Trees: ['forest', 'nature', 'wood', 'environment', 'outdoor', 'park'],
  TreeDeciduous: ['nature', 'forest', 'wood', 'oak', 'plant', 'growth', 'tree'],
  TreePalm: ['tropical', 'beach', 'vacation', 'palm', 'island'],
  TreePine: ['evergreen', 'christmas', 'forest', 'winter', 'conifer'],
  Leaf: ['nature', 'autumn', 'fall', 'plant', 'green', 'foliage', 'eco'],
  Bird: ['nature', 'fly', 'animal', 'wings', 'tweet', 'avian'],
  Fish: ['sea', 'ocean', 'water', 'marine', 'aquarium', 'swim'],
  Bug: ['insect', 'nature', 'beetle', 'error', 'issue'],
  Butterfly: ['nature', 'transform', 'beauty', 'flutter', 'metamorphosis'],
  Cat: ['pet', 'animal', 'kitten', 'feline', 'meow'],
  Dog: ['pet', 'animal', 'puppy', 'canine', 'bark', 'friend'],
  Rabbit: ['bunny', 'animal', 'easter', 'hop', 'cute'],
  Squirrel: ['nature', 'animal', 'nuts', 'tree', 'forest'],
  Cherry: ['fruit', 'nature', 'sweet', 'spring', 'blossom'],
  Apple: ['fruit', 'nature', 'food', 'healthy', 'orchard'],

  // Weather
  Sun: ['day', 'bright', 'warm', 'light', 'sunshine', 'solar', 'summer', 'hot'],
  Sunrise: ['morning', 'dawn', 'early', 'start', 'beginning', 'wake'],
  Sunset: ['evening', 'dusk', 'end', 'twilight', 'golden'],
  Cloud: ['weather', 'sky', 'cloudy', 'overcast'],
  CloudRain: ['rain', 'weather', 'wet', 'shower', 'precipitation'],
  CloudSnow: ['snow', 'winter', 'cold', 'blizzard', 'weather'],
  CloudLightning: ['storm', 'thunder', 'lightning', 'weather', 'electric'],
  Snowflake: ['cold', 'winter', 'snow', 'frozen', 'ice', 'christmas'],
  Wind: ['breeze', 'air', 'weather', 'blow', 'gust'],
  Rainbow: ['colors', 'spectrum', 'weather', 'hope', 'diversity'],

  // People & Movement
  User: ['person', 'people', 'human', 'individual', 'profile', 'account'],
  Users: ['people', 'group', 'team', 'community', 'crowd', 'social'],
  PersonStanding: ['walk', 'stand', 'human', 'person', 'figure', 'pedestrian'],
  Baby: ['child', 'infant', 'newborn', 'young', 'kid'],
  Footprints: ['walk', 'steps', 'path', 'trail', 'journey', 'tracks'],
  HandMetal: ['rock', 'gesture', 'cool', 'hand', 'sign'],
  HandHeart: ['love', 'care', 'support', 'help', 'gesture'],
  Handshake: ['agreement', 'deal', 'meet', 'partnership', 'cooperation'],

  // Travel & Navigation
  Navigation: ['gps', 'location', 'direction', 'compass', 'navigate'],
  MapPin: ['location', 'place', 'pin', 'marker', 'destination'],
  Map: ['navigation', 'travel', 'geography', 'location', 'route'],
  Compass: ['direction', 'navigation', 'north', 'south', 'orientation'],
  Plane: ['travel', 'fly', 'airplane', 'flight', 'aviation', 'journey'],
  Car: ['drive', 'vehicle', 'automobile', 'transport', 'road'],
  Ship: ['boat', 'sail', 'ocean', 'marine', 'vessel', 'cruise'],
  Train: ['railway', 'railroad', 'subway', 'metro', 'transport'],
  Rocket: ['space', 'launch', 'fast', 'startup', 'blast'],
  Move: ['walk', 'go', 'travel', 'relocate', 'motion'],

  // Communication
  MessageCircle: ['chat', 'message', 'talk', 'bubble', 'conversation', 'comment', 'discuss'],
  MessageSquare: ['chat', 'message', 'talk', 'text', 'sms', 'communicate'],
  Mail: ['email', 'message', 'letter', 'envelope', 'send', 'inbox'],
  Phone: ['call', 'telephone', 'mobile', 'contact', 'ring'],
  Video: ['camera', 'record', 'film', 'movie', 'call'],
  AtSign: ['at', 'email', 'mention', 'tag', 'username'],

  // Time
  Clock: ['time', 'hour', 'minute', 'schedule', 'watch', 'timing'],
  Timer: ['countdown', 'stopwatch', 'time', 'clock', 'alarm'],
  Hourglass: ['time', 'wait', 'loading', 'patience', 'sand'],
  Calendar: ['date', 'schedule', 'plan', 'event', 'month', 'year'],
  Watch: ['time', 'wrist', 'clock', 'accessory'],
  AlarmClock: ['wake', 'morning', 'time', 'alert', 'ring'],

  // Music & Audio
  Music: ['song', 'melody', 'audio', 'tune', 'sound', 'note', 'rhythm'],
  Mic: ['microphone', 'record', 'speak', 'voice', 'audio', 'podcast'],
  Headphones: ['listen', 'audio', 'music', 'sound', 'earphones'],
  Radio: ['broadcast', 'audio', 'music', 'fm', 'am', 'wireless'],
  Piano: ['music', 'keyboard', 'instrument', 'keys', 'play'],
  Guitar: ['music', 'instrument', 'strings', 'rock', 'acoustic'],
  Speaker: ['audio', 'sound', 'volume', 'music', 'loud'],

  // Writing & Creation
  Book: ['story', 'novel', 'read', 'literature', 'library', 'knowledge', 'study'],
  BookOpen: ['read', 'open', 'study', 'learn', 'education'],
  PenSquare: ['edit', 'write', 'compose', 'draft', 'note', 'modify'],
  Pencil: ['write', 'draw', 'edit', 'draft', 'sketch'],
  Feather: ['poetry', 'write', 'quill', 'story', 'author', 'literature'],
  NotebookPen: ['journal', 'notes', 'write', 'diary', 'log'],
  Quote: ['quotation', 'speech', 'saying', 'cite', 'reference'],

  // Technology
  Laptop: ['computer', 'pc', 'work', 'tech', 'device', 'notebook'],
  Monitor: ['screen', 'display', 'desktop', 'computer', 'tv'],
  Smartphone: ['phone', 'mobile', 'cell', 'iphone', 'android', 'device'],
  Tablet: ['ipad', 'device', 'touch', 'screen', 'portable'],
  Code: ['programming', 'coding', 'develop', 'software', 'script'],
  Terminal: ['console', 'command', 'cli', 'shell', 'prompt'],
  Wifi: ['internet', 'wireless', 'network', 'connection', 'online'],
  Database: ['data', 'storage', 'server', 'sql', 'information'],

  // Files & Documents
  File: ['document', 'paper', 'page', 'sheet'],
  FileText: ['document', 'text', 'paper', 'note', 'report'],
  Folder: ['directory', 'files', 'organize', 'storage'],
  Download: ['save', 'get', 'fetch', 'retrieve'],
  Upload: ['send', 'share', 'post', 'transmit'],
  Copy: ['duplicate', 'clone', 'replicate', 'paste'],

  // Status & Feedback
  Check: ['done', 'complete', 'success', 'yes', 'ok', 'approve'],
  X: ['close', 'cancel', 'no', 'delete', 'remove', 'exit'],
  AlertCircle: ['warning', 'attention', 'notice', 'important', 'caution'],
  Info: ['information', 'about', 'details', 'help', 'faq'],
  HelpCircle: ['help', 'question', 'support', 'faq', 'assist'],

  // Media
  Play: ['start', 'begin', 'go', 'resume', 'continue'],
  Pause: ['stop', 'wait', 'hold', 'break', 'suspend'],
  Camera: ['photo', 'picture', 'snapshot', 'capture', 'photograph'],
  Film: ['movie', 'video', 'cinema', 'motion', 'reel'],
  Image: ['picture', 'photo', 'graphic', 'visual', 'artwork'],
  Tv: ['television', 'screen', 'watch', 'broadcast', 'channel'],

  // Games & Entertainment
  Gamepad: ['game', 'play', 'controller', 'console', 'gaming'],
  Gamepad2: ['game', 'play', 'controller', 'playstation', 'xbox'],
  Dice1: ['game', 'random', 'chance', 'gamble', 'roll'],

  // Business & Finance
  Briefcase: ['work', 'business', 'office', 'job', 'professional'],
  TrendingUp: ['growth', 'increase', 'rise', 'profit', 'success'],
  TrendingDown: ['decrease', 'fall', 'loss', 'decline', 'down'],
  DollarSign: ['money', 'cash', 'currency', 'price', 'cost', 'dollar'],
  CreditCard: ['payment', 'card', 'pay', 'purchase', 'transaction'],

  // Home & Places
  Home: ['house', 'residence', 'dwelling', 'place', 'family'],
  Building: ['office', 'work', 'structure', 'architecture', 'city'],
  Castle: ['fortress', 'palace', 'royal', 'kingdom', 'medieval'],
  School: ['education', 'learn', 'study', 'academy', 'university'],
  Hospital: ['medical', 'health', 'clinic', 'emergency', 'doctor'],

  // Food & Drink
  Coffee: ['drink', 'caffeine', 'morning', 'beverage', 'espresso', 'latte'],
  Pizza: ['food', 'italian', 'slice', 'cheese', 'meal'],
  Wine: ['drink', 'alcohol', 'grape', 'glass', 'beverage'],
  Beer: ['drink', 'alcohol', 'brew', 'pub', 'ale'],
  Cookie: ['dessert', 'sweet', 'biscuit', 'treat', 'snack'],
  IceCream: ['dessert', 'sweet', 'cold', 'summer', 'treat'],

  // Celebration
  PartyPopper: ['celebration', 'party', 'confetti', 'festive', 'fun'],
  Gift: ['present', 'surprise', 'box', 'birthday', 'christmas'],
  Cake: ['birthday', 'dessert', 'celebration', 'sweet', 'party'],
  Trophy: ['win', 'champion', 'prize', 'victory', 'achievement'],
  Crown: ['king', 'queen', 'royal', 'winner', 'best'],

  // Security
  Lock: ['secure', 'private', 'closed', 'locked', 'protected'],
  Unlock: ['open', 'access', 'unlocked', 'available'],
  Key: ['password', 'access', 'unlock', 'security', 'secret'],
  Shield: ['protect', 'security', 'safe', 'guard', 'defense'],

  // Arrows
  ArrowRight: ['next', 'forward', 'go', 'proceed', 'continue'],
  ArrowLeft: ['back', 'previous', 'return', 'backward'],
  ArrowUp: ['up', 'top', 'rise', 'increase', 'ascend'],
  ArrowDown: ['down', 'bottom', 'decrease', 'descend', 'fall'],

  // Other useful icons
  Zap: ['electric', 'energy', 'power', 'lightning', 'fast', 'quick', 'spark'],
  Circle: ['round', 'shape', 'dot', 'point', 'bullet'],
  Square: ['box', 'shape', 'rectangle', 'block'],
  Triangle: ['shape', 'delta', 'pyramid', 'arrow'],
  Diamond: ['gem', 'jewel', 'precious', 'crystal', 'luxury'],
  Gem: ['jewel', 'diamond', 'precious', 'crystal', 'valuable'],
  Anchor: ['ship', 'marine', 'nautical', 'boat', 'stable'],
  Flag: ['country', 'nation', 'banner', 'mark', 'report'],
  Bell: ['notification', 'alert', 'ring', 'alarm', 'reminder'],
  Bookmark: ['save', 'mark', 'favorite', 'remember', 'tag'],
  Activity: ['pulse', 'heartbeat', 'monitor', 'track', 'fitness'],
  Palette: ['color', 'art', 'paint', 'design', 'creative'],
  Brush: ['paint', 'art', 'draw', 'design', 'create'],
  Wand: ['magic', 'wizard', 'spell', 'fantasy', 'enchant'],
  Wand2: ['magic', 'sparkle', 'wizard', 'spell', 'enchant'],
  Target: ['goal', 'aim', 'bullseye', 'objective', 'focus'],
  Award: ['prize', 'medal', 'achievement', 'honor', 'recognition'],
  Medal: ['award', 'prize', 'achievement', 'honor', 'first'],
  Swords: ['battle', 'fight', 'combat', 'duel', 'war'],
  Thermometer: ['temperature', 'weather', 'fever', 'hot', 'cold'],
  Umbrella: ['rain', 'weather', 'protection', 'shelter', 'wet'],
  Mountain: ['peak', 'hill', 'climb', 'nature', 'outdoor'],
  MountainSnow: ['peak', 'winter', 'ski', 'alpine', 'cold'],
  Waves: ['ocean', 'sea', 'water', 'beach', 'surf'],
} as const;