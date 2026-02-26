-- Sample seed data for recipes table
-- Insert a few recipes. Adjust timestamps or IDs if needed.

insert into public.recipes (title, description, ingredients, steps, category, prep_time, cook_time, servings, tags, image_url)
values
(
  'Classic Pancakes',
  'Fluffy, easy-to-make pancakes perfect for breakfast.',
  '[{"name":"Flour","quantity":"1 1/2 cups"},{"name":"Milk","quantity":"1 1/4 cups"},{"name":"Egg","quantity":"1"},{"name":"Baking Powder","quantity":"3 1/2 tsp"},{"name":"Salt","quantity":"1 tsp"}]',
  '["Mix dry ingredients.", "Whisk in milk and egg.", "Cook on hot griddle until golden."]',
  'Breakfast',
  10,
  15,
  4,
  '{breakfast,sweet}',
  'https://placehold.co/1200x800/png?text=Classic+Pancakes&bg=F5F5F5&fg=333'
),
(
  'Spaghetti Aglio e Olio',
  'Simple Italian pasta with garlic, olive oil and chili flakes.',
  '[{"name":"Spaghetti","quantity":"400g"},{"name":"Garlic","quantity":"4 cloves"},{"name":"Olive Oil","quantity":"1/3 cup"},{"name":"Parsley","quantity":"2 tbsp"}]',
  '["Cook spaghetti al dente.", "Sauté garlic in olive oil until golden.", "Toss pasta with oil, garlic, parsley, and chili flakes."]',
  'Main',
  10,
  15,
  4,
  '{italian,quick}',
  'https://placehold.co/1200x800/png?text=Spaghetti+Aglio+e+Olio&bg=F5F5F5&fg=333'
),
(
  'Chipotle Chicken Salad',
  'Smoky chipotle chicken with mixed greens and avocado.',
  '[{"name":"Chicken Breast","quantity":"500g"},{"name":"Chipotle in Adobo","quantity":"2 tbsp"},{"name":"Lettuce","quantity":"4 cups"},{"name":"Avocado","quantity":"1"}]',
  '["Marinate and grill chicken.", "Slice and toss with greens, avocado and dressing."]',
  'Salad',
  15,
  10,
  4,
  '{salad,protein}',
  'https://placehold.co/1200x800/png?text=Chipotle+Chicken+Salad&bg=F5F5F5&fg=333'
);

insert into public.recipes (title, description, ingredients, steps, category, prep_time, cook_time, servings, tags, image_url)
values
(
  'Creamy Tomato Soup',
  'Comforting tomato soup with cream and basil.',
  '[{"name":"Tomatoes","quantity":"800g"},{"name":"Onion","quantity":"1"},{"name":"Garlic","quantity":"2 cloves"},{"name":"Cream","quantity":"1/2 cup"}]',
  '["Sauté onion and garlic.", "Add tomatoes and simmer.", "Blend and stir in cream and basil."]',
  'Soup',
  10,
  30,
  4,
  '{soup,comfort}',
  'https://placehold.co/1200x800/png?text=Creamy+Tomato+Soup&bg=F5F5F5&fg=333'
),
(
  'Grilled Cheese Sandwich',
  'Crispy buttery bread with melted cheese.',
  '[{"name":"Bread Slices","quantity":"4"},{"name":"Cheddar","quantity":"4 slices"},{"name":"Butter","quantity":"2 tbsp"}]',
  '["Butter bread, add cheese, grill until golden."]',
  'Snack',
  5,
  10,
  1,
  '{quick,comfort}',
  'https://placehold.co/1200x800/png?text=Grilled+Cheese+Sandwich&bg=F5F5F5&fg=333'
),
(
  'Avocado Toast',
  'Simple avocado toast with lemon and chili.',
  '[{"name":"Bread","quantity":"2 slices"},{"name":"Avocado","quantity":"1"},{"name":"Lemon","quantity":"1/2"}]',
  '["Toast bread.", "Mash avocado with lemon, salt, and pepper, spread on toast."]',
  'Breakfast',
  5,
  0,
  1,
  '{breakfast,quick}',
  'https://placehold.co/1200x800/png?text=Avocado+Toast&bg=F5F5F5&fg=333'
),
(
  'Beef Stir Fry',
  'Quick stir-fried beef with vegetables and soy sauce.',
  '[{"name":"Beef","quantity":"400g"},{"name":"Bell Pepper","quantity":"1"},{"name":"Broccoli","quantity":"1 cup"},{"name":"Soy Sauce","quantity":"2 tbsp"}]',
  '["Slice and marinate beef.", "Stir fry beef and vegetables, add sauce."]',
  'Main',
  15,
  10,
  4,
  '{stirfry,protein}',
  'https://placehold.co/1200x800/png?text=Beef+Stir+Fry&bg=F5F5F5&fg=333'
),
(
  'Lentil Curry',
  'Hearty lentil curry with spices.',
  '[{"name":"Red Lentils","quantity":"1 cup"},{"name":"Onion","quantity":"1"},{"name":"Tomato","quantity":"1"},{"name":"Curry Powder","quantity":"1 tbsp"}]',
  '["Sauté onion and spices.", "Add lentils and tomato, simmer until tender."]',
  'Main',
  10,
  25,
  4,
  '{vegan,spicy}',
  'https://placehold.co/1200x800/png?text=Lentil+Curry&bg=F5F5F5&fg=333'
),
(
  'Banana Bread',
  'Moist banana bread with walnuts.',
  '[{"name":"Bananas","quantity":"3"},{"name":"Flour","quantity":"2 cups"},{"name":"Sugar","quantity":"3/4 cup"},{"name":"Walnuts","quantity":"1/2 cup"}]',
  '["Mash bananas.", "Mix ingredients and bake at 350F for 60 minutes."]',
  'Baking',
  15,
  60,
  8,
  '{bake,sweet}',
  'https://placehold.co/1200x800/png?text=Banana+Bread&bg=F5F5F5&fg=333'
),
(
  'Greek Salad',
  'Fresh salad with feta, olives, and cucumber.',
  '[{"name":"Cucumber","quantity":"1"},{"name":"Tomato","quantity":"2"},{"name":"Feta","quantity":"100g"},{"name":"Olives","quantity":"1/2 cup"}]',
  '["Chop ingredients and toss with olive oil and lemon."]',
  'Salad',
  10,
  0,
  2,
  '{salad,mediterranean}',
  'https://placehold.co/1200x800/png?text=Greek+Salad&bg=F5F5F5&fg=333'
),
(
  'Chocolate Chip Cookies',
  'Classic chewy chocolate chip cookies.',
  '[{"name":"Flour","quantity":"2 1/4 cups"},{"name":"Sugar","quantity":"3/4 cup"},{"name":"Butter","quantity":"1 cup"},{"name":"Chocolate Chips","quantity":"1 1/2 cups"}]',
  '["Cream butter and sugar.", "Add flour and chips.", "Scoop onto baking sheet and bake 10-12 minutes."]',
  'Dessert',
  15,
  12,
  24,
  '{baking,sweet}',
  'https://placehold.co/1200x800/png?text=Chocolate+Chip+Cookies&bg=F5F5F5&fg=333'
),
(
  'Shrimp Tacos',
  'Spicy shrimp tacos with cabbage slaw.',
  '[{"name":"Shrimp","quantity":"500g"},{"name":"Tortillas","quantity":"8"},{"name":"Cabbage","quantity":"2 cups"},{"name":"Lime","quantity":"1"}]',
  '["Season and cook shrimp.", "Assemble tacos with slaw and lime."]',
  'Main',
  15,
  10,
  4,
  '{seafood,spicy}',
  'https://placehold.co/1200x800/png?text=Shrimp+Tacos&bg=F5F5F5&fg=333'
),
(
  'Vegetable Stir Fry',
  'Colorful vegetable stir fry with sesame.',
  '[{"name":"Carrot","quantity":"1"},{"name":"Bell Pepper","quantity":"1"},{"name":"Snow Peas","quantity":"1 cup"},{"name":"Sesame Oil","quantity":"1 tbsp"}]',
  '["Stir fry vegetables in sesame oil and soy sauce."]',
  'Main',
  10,
  8,
  3,
  '{vegetarian,quick}',
  'https://placehold.co/1200x800/png?text=Vegetable+Stir+Fry&bg=F5F5F5&fg=333'
),
(
  'Cheese Omelette',
  'Fluffy omelette with cheese and herbs.',
  '[{"name":"Eggs","quantity":"3"},{"name":"Cheese","quantity":"1/4 cup"},{"name":"Chives","quantity":"1 tbsp"}]',
  '["Beat eggs.", "Cook in butter, add cheese, fold and serve."]',
  'Breakfast',
  5,
  5,
  1,
  '{breakfast,quick}',
  'https://placehold.co/1200x800/png?text=Cheese+Omelette&bg=F5F5F5&fg=333'
);
