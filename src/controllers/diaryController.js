const { validationResult } = require('express-validator');
const knex = require('../config/database');

const diaryController = {
  async createDiary(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, content } = req.body;
      const userId = req.user.userId;

      // Auto-generate title if not provided
      const finalTitle = title || `Entry - ${new Date().toLocaleDateString()}`;

      const [diaryId] = await knex('diary_entries').insert({
        user_id: userId,
        title: finalTitle,
        content: content
      }).returning('id');

      // Get the created entry
      const createdEntry = await knex('diary_entries')
        .where({ id: diaryId, user_id: userId })
        .first();

      res.status(201).json({
        success: true,
        message: 'Diary entry created successfully',
        data: createdEntry
      });
    } catch (error) {
      console.error('Create diary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getDiaries(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalCount = await knex('diary_entries')
        .where({ user_id: userId })
        .count('id as count')
        .first();

      const total = parseInt(totalCount.count);
      const totalPages = Math.ceil(total / limit);

      // Get entries with pagination
      const entries = await knex('diary_entries')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .select('id', 'title', 'content', 'created_at', 'updated_at');

      // Add content preview (first 100 characters)
      const entriesWithPreview = entries.map(entry => ({
        ...entry,
        content_preview: entry.content.length > 100 
          ? entry.content.substring(0, 100) + '...'
          : entry.content
      }));

      res.json({
        success: true,
        data: {
          entries: entriesWithPreview,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_entries: total,
            entries_per_page: limit,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get diaries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getDiaryById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const entry = await knex('diary_entries')
        .where({ id, user_id: userId })
        .first();

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Diary entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get diary by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async updateDiary(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.userId;

      // Check if entry exists and belongs to user
      const existingEntry = await knex('diary_entries')
        .where({ id, user_id: userId })
        .first();

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          message: 'Diary entry not found'
        });
      }

      // Update entry
      await knex('diary_entries')
        .where({ id, user_id: userId })
        .update({
          title: title || existingEntry.title,
          content,
          updated_at: knex.fn.now()
        });

      // Get updated entry
      const updatedEntry = await knex('diary_entries')
        .where({ id, user_id: userId })
        .first();

      res.json({
        success: true,
        message: 'Diary entry updated successfully',
        data: updatedEntry
      });
    } catch (error) {
      console.error('Update diary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async deleteDiary(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Check if entry exists and belongs to user
      const existingEntry = await knex('diary_entries')
        .where({ id, user_id: userId })
        .first();

      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          message: 'Diary entry not found'
        });
      }

      // Delete entry
      await knex('diary_entries')
        .where({ id, user_id: userId })
        .del();

      res.json({
        success: true,
        message: 'Diary entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete diary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async searchDiaries(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        q: searchQuery, 
        from_date: fromDate, 
        to_date: toDate,
        page = 1,
        clear_filters 
      } = req.query;

      // If clear_filters is present, redirect to regular getDiaries
      if (clear_filters === 'true') {
        return diaryController.getDiaries(req, res);
      }

      const limit = 10;
      const offset = (parseInt(page) - 1) * limit;

      // Build the query
      let query = knex('diary_entries').where({ user_id: userId });
      let countQuery = knex('diary_entries').where({ user_id: userId });

      // Add content search filter
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = `%${searchQuery.trim()}%`;
        query = query.where(function() {
          this.where('title', 'ilike', searchTerm)
              .orWhere('content', 'ilike', searchTerm);
        });
        countQuery = countQuery.where(function() {
          this.where('title', 'ilike', searchTerm)
              .orWhere('content', 'ilike', searchTerm);
        });
      }

      // Add date range filters
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        fromDateTime.setHours(0, 0, 0, 0);
        query = query.where('created_at', '>=', fromDateTime);
        countQuery = countQuery.where('created_at', '>=', fromDateTime);
      }

      if (toDate) {
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999);
        query = query.where('created_at', '<=', toDateTime);
        countQuery = countQuery.where('created_at', '<=', toDateTime);
      }

      // Get total count for pagination
      const totalCount = await countQuery.count('id as count').first();
      const total = parseInt(totalCount.count);
      const totalPages = Math.ceil(total / limit);

      // Get entries with pagination
      const entries = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .select('id', 'title', 'content', 'created_at', 'updated_at');

      // Add content preview (first 100 characters)
      const entriesWithPreview = entries.map(entry => ({
        ...entry,
        content_preview: entry.content.length > 100 
          ? entry.content.substring(0, 100) + '...'
          : entry.content
      }));

      // Build response with search context
      const searchContext = {
        has_search: !!(searchQuery || fromDate || toDate),
        search_query: searchQuery || null,
        from_date: fromDate || null,
        to_date: toDate || null
      };

      res.json({
        success: true,
        data: {
          entries: entriesWithPreview,
          search: searchContext,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_entries: total,
            entries_per_page: limit,
            has_next: parseInt(page) < totalPages,
            has_prev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Search diaries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = diaryController;