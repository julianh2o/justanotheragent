// BAML function for extracting contact information from conversation snippets

class FieldSuggestion {
  fieldId string @description("The field identifier (e.g., 'birthday', 'notes', 'transient_info', or custom field id)")
  fieldName string @description("Human-readable field name")
  suggestedValue string @description("The suggested value to set")
  confidence float @description("Confidence score between 0 and 1")
  reasoning string @description("Brief explanation of why this suggestion was made")
}

class TagSuggestion {
  tagName string @description("Name of the tag to add")
  confidence float @description("Confidence score between 0 and 1")
  reasoning string @description("Brief explanation of why this tag should be added")
}

class SuggestedUpdates {
  fieldSuggestions FieldSuggestion[] @description("Suggested updates to contact fields")
  tagSuggestions TagSuggestion[] @description("Suggested tags to add to the contact")
}

class ConversationInput {
  conversationSnippet string @description("The conversation text between the user and the contact")
  contactName string @description("The name of the contact")
  currentDate string @description("Today's date in YYYY-MM-DD format for context")
  availableFields string @description("List of available custom fields with their IDs and names")
  currentValues string @description("JSON object of current field values for this contact")
  availableTags string @description("Comma-separated list of existing tags that can be suggested")
}

function ExtractContactInfo(input: ConversationInput) -> SuggestedUpdates {
  client Ollama

  prompt #"
    You are analyzing a conversation to extract useful information about a contact named {{ input.contactName }}.

    Today's date is: {{ input.currentDate }}

    CONVERSATION:
    {{ input.conversationSnippet }}

    AVAILABLE FIELDS TO UPDATE:
    - birthday: The contact's birthday (format: YYYY-MM-DD)
    - notes: General notes about the contact
    - transient_info: Short-term or time-sensitive information like travel plans, temporary situations, upcoming events
    {{ input.availableFields }}. IMPORTANT: only include these if they are still relevant near the current date. (old travel plans can be ignored unless they are clearly recurring)

    CURRENT VALUES:
    {{ input.currentValues }}

    AVAILABLE TAGS (only suggest from this list):
    {{ input.availableTags }}

    INSTRUCTIONS:
    1. Analyze the conversation for any useful information about {{ input.contactName }}
    2. Look specifically for:
       - Travel dates and short-term plans (e.g., "I'm leaving for SF tomorrow until Thursday") - use transient_info field
       - Birthday mentions or age-related information
       - Preferences, interests, hobbies
       - Important life events or changes
       - Work schedule or availability patterns
       - Gift ideas or things they like
       - Conversation topics that may be worth following up on or engaging on
       - Any other relevant personal information. IMPORTANT: this must be about the person, their likes, dislikes, hobbies, and preferences

    3. For transient_info, include dates when possible (e.g., "Traveling to SF Jan 20-24, 2026")

    4. Only suggest updates when you have reasonable confidence (0.8 or higher) and that the information is still relevant near the current date.

    5. Do not suggest values that are already set to the same thing in current values

    6. For tags, ONLY suggest tags from the AVAILABLE TAGS list above. Do not invent new tags.
       If no existing tags are relevant, return an empty tagSuggestions array.

    7. IMPORTANT: Updates should be very brief and factual, eg. likes persimmons. Do not fill with complete sentences.

    8. IMPORTANT: If it's not very clear from the context that the message specifically indicates something that is true/essential about that individual, do not suggest it.

    Return your analysis as structured data with field suggestions and tag suggestions.
    Each suggestion should include a confidence score and brief reasoning.

    {{ ctx.output_format }}
  "#
}
