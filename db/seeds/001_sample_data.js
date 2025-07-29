const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('diary_entries').del();
  await knex('users').del();

  // Hash passwords
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('mypassword', 10);
  const hashedPassword3 = await bcrypt.hash('secretpass', 10);

  // Insert sample users
  const users = await knex('users').insert([
    {
      username: 'johndoe',
      email: 'john@example.com',
      password_hash: hashedPassword1,
      created_at: new Date()
    },
    {
      username: 'janedoe',
      email: 'jane@example.com',
      password_hash: hashedPassword2,
      created_at: new Date()
    },
    {
      username: 'mikebrown',
      email: 'mike@example.com',
      password_hash: hashedPassword3,
      created_at: new Date()
    }
  ]).returning('id');

  // Get user IDs (handle both PostgreSQL and other DB responses)
  const userId1 = users[0].id || users[0];
  const userId2 = users[1].id || users[1];
  const userId3 = users[2].id || users[2];

  // Insert sample diary entries
  await knex('diary_entries').insert([
    {
      user_id: userId1,
      title: 'My First Day',
      content: 'Today was an amazing day! I started using this diary app and I am excited to document my daily thoughts and experiences. The weather was perfect and I had a great conversation with my friend.',
      entry_date: new Date('2024-01-15'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      user_id: userId1,
      title: 'Work Reflections',
      content: 'Had a productive meeting today with the team. We discussed our quarterly goals and I feel motivated about the upcoming projects. Need to focus more on work-life balance though.',
      entry_date: new Date('2024-01-16'),
      created_at: new Date('2024-01-16'),
      updated_at: new Date('2024-01-16')
    },
    {
      user_id: userId2,
      title: 'Weekend Adventures',
      content: 'Went hiking with my family this weekend. The trail was challenging but the view from the top was absolutely breathtaking. My kids loved exploring nature and we saw some beautiful wildlife.',
      entry_date: new Date('2024-01-14'),
      created_at: new Date('2024-01-14'),
      updated_at: new Date('2024-01-14')
    },
    {
      user_id: userId2,
      title: 'Cooking Experiment',
      content: 'Tried making a new recipe today - Thai curry with vegetables. It turned out better than expected! The family really enjoyed it. I think I\'ll add this to our regular meal rotation.',
      entry_date: new Date('2024-01-17'),
      created_at: new Date('2024-01-17'),
      updated_at: new Date('2024-01-17')
    },
    {
      user_id: userId3,
      title: 'Learning Journey',
      content: 'Started learning a new programming language today. It\'s challenging but I can already see the potential. Planning to build a small project to practice what I\'ve learned so far.',
      entry_date: new Date('2024-01-18'),
      created_at: new Date('2024-01-18'),
      updated_at: new Date('2024-01-18')
    }
  ]);
};