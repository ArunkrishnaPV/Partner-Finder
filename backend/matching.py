import math

def calculate_jaccard(set1, set2):
    if not set1 and not set2:
        return 0.0
    s1, s2 = set(set1), set(set2)
    intersection = len(s1.intersection(s2))
    union = len(s1.union(s2))
    if union == 0:
        return 0.0
    return (intersection / union) * 100.0

def flatten_availability(availability_dict):
    """Converts {'monday': ['morning', 'afternoon']} to ['monday-morning', 'monday-afternoon']"""
    slots = []
    if not availability_dict:
        return slots
    for day, times in availability_dict.items():
        for t in times:
            slots.append(f"{day}-{t}")
    return slots

def calculate_match_score(user_profile, partner_profile):
    """
    Returns the match score (0-100), label, and common attributes.
    Weights: Subjects: 40%, Skills: 30%, Interests: 15%, Availability: 15%
    """
    u_subs = user_profile.get('subjects', [])
    p_subs = partner_profile.get('subjects', [])
    sub_score = calculate_jaccard(u_subs, p_subs)

    u_skills = user_profile.get('skills', [])
    p_skills = partner_profile.get('skills', [])
    skill_score = calculate_jaccard(u_skills, p_skills)

    u_ints = user_profile.get('interests', [])
    p_ints = partner_profile.get('interests', [])
    int_score = calculate_jaccard(u_ints, p_ints)

    u_avail = flatten_availability(user_profile.get('availability', {}))
    p_avail = flatten_availability(partner_profile.get('availability', {}))
    avail_score = calculate_jaccard(u_avail, p_avail)

    final_score = (0.40 * sub_score) + (0.30 * skill_score) + (0.15 * int_score) + (0.15 * avail_score)
    rounded_score = int(round(final_score))

    label = "Low"
    if rounded_score >= 80:
        label = "Excellent"
    elif rounded_score >= 60:
        label = "Good"
    elif rounded_score >= 40:
        label = "Moderate"

    common_subs = list(set(u_subs).intersection(set(p_subs)))
    common_skills = list(set(u_skills).intersection(set(p_skills)))
    common_ints = list(set(u_ints).intersection(set(p_ints)))
    common_avail = list(set(u_avail).intersection(set(p_avail)))

    # Generate why you match explanation
    explanation_parts = []
    if common_subs:
        explanation_parts.append(f"{len(common_subs)} shared subject(s)")
    if common_skills:
        explanation_parts.append(f"{len(common_skills)} shared skill(s)")
    
    explanation = "Matches well."
    if explanation_parts:
        explanation = "Strong match on " + " and ".join(explanation_parts) + "."

    return {
        'score': rounded_score,
        'label': label,
        'commonSubjects': common_subs,
        'commonSkills': common_skills,
        'commonInterests': common_ints,
        'commonAvailability': common_avail,
        'explanation': explanation
    }

def calculate_profile_completion(profile):
    """
    Basic details: 15%
    Department: 10%
    Subjects: 20%
    Skills: 20%
    Interests: 15%
    Availability: 15%
    Partner type: 5%
    Total: 100%
    """
    score = 0
    if profile.get('name') and profile.get('college') and profile.get('year'):
        score += 15
    if profile.get('department'):
        score += 10
    if profile.get('subjects') and len(profile.get('subjects')) > 0:
        score += 20
    if profile.get('skills') and len(profile.get('skills')) > 0:
        score += 20
    if profile.get('interests') and len(profile.get('interests')) > 0:
        score += 15
    if profile.get('availability') and any(len(v) > 0 for v in profile.get('availability').values()):
        score += 15
    if profile.get('partnerType'):
        score += 5
    return score
