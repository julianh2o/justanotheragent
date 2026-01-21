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
  fieldSuggestions FieldSuggestion[] @description("Suggested updates to contact fields. Empty array if nothing noteworthy.")
  tagSuggestions TagSuggestion[] @description("Suggested tags to add to the contact. Empty array if no tags apply.")
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
    You are a strict filter analyzing a conversation for ONLY highly significant, explicitly stated facts about {{ input.contactName }}.

    Today's date: {{ input.currentDate }}

    CONVERSATION:
    {{ input.conversationSnippet }}

    CURRENT VALUES (do not duplicate):
    {{ input.currentValues }}

    AVAILABLE FIELDS:
    - birthday: Contact's birthday (YYYY-MM-DD) - ONLY if they explicitly state their birth date
    - notes: Significant personal facts - ONLY for major life facts explicitly stated
    - transient_info: Time-sensitive info with dates (e.g., "Traveling to SF Jan 20-24")
    {{ input.availableFields }}

    AVAILABLE TAGS (only from this list, or leave empty):
    {{ input.availableTags }}

    STRICT RULES - READ CAREFULLY:

    1. DEFAULT TO EMPTY ARRAYS. Most conversations contain nothing worth recording. Return empty arrays unless you find something truly exceptional.

    2. ONLY extract information that is:
       - EXPLICITLY and DIRECTLY stated by {{ input.contactName }} (not implied, not inferred)
       - A concrete, verifiable FACT (not opinions about everyday things, not casual preferences)
       - SIGNIFICANT enough to remember long-term (birthdays, major life events, strong passions)
       - NOT already in current values

    3. DO NOT EXTRACT:
       - Casual conversation topics ("we talked about movies" - NO)
       - Minor preferences ("said the food was good" - NO)
       - Implied information ("seems busy" - NO)
       - Temporary moods or states ("having a rough day" - NO)
       - Plans without specific dates ("might visit sometime" - NO)
       - Anything you're inferring rather than reading directly
       - Tags, they're typically managed by the user manually

    4. EXAMPLES OF WHAT TO EXTRACT (rare):
       - "My birthday is March 15th" -> birthday field
       - "I'm a vegetarian" -> notes (significant dietary restriction)
       - "I'll be in Tokyo from Jan 5-12" -> transient_info with dates
       - "I'm getting married in June" -> notes (major life event)

    5. EXAMPLES OF WHAT NOT TO EXTRACT (common):
       - "Had a great dinner" -> NO (not a lasting fact)
       - "Work has been busy" -> NO (temporary state)
       - "I liked that movie" -> NO (minor preference)
       - "Maybe we should hang out" -> NO (vague plan)
       - "I'm tired today" -> NO (temporary)

    6. Confidence must be 0.95+ to include. If you're not absolutely certain, DO NOT include it.

    7. When in doubt, return empty arrays: {"fieldSuggestions": [], "tagSuggestions": []}

    {{ ctx.output_format }}
  "#
}
