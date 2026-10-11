import unittest
from backend.matching import calculate_match_score, calculate_jaccard, calculate_profile_completion

class TestMatchingAlgorithm(unittest.TestCase):
    
    def test_jaccard_empty(self):
        self.assertEqual(calculate_jaccard([], []), 0.0)
    
    def test_jaccard_identical(self):
        self.assertEqual(calculate_jaccard(['a', 'b'], ['a', 'b']), 100.0)
        
    def test_jaccard_disjoint(self):
        self.assertEqual(calculate_jaccard(['a'], ['b']), 0.0)
        
    def test_calculate_match_score(self):
        user_profile = {
            'subjects': ['Math', 'Physics'],
            'skills': ['Python', 'C++'],
            'interests': ['AI', 'Robotics'],
            'availability': {'monday': ['morning', 'afternoon']}
        }
        
        partner_profile = {
            'subjects': ['Math', 'Chemistry'],
            'skills': ['Python', 'Java'],
            'interests': ['AI', 'Sports'],
            'availability': {'monday': ['morning']}
        }
        
        # Jaccard calculations:
        # Subjects: Math is common. Union: Math, Physics, Chem = 1/3 = 33.33%
        # Skills: Python common. Union: Python, C++, Java = 1/3 = 33.33%
        # Interests: AI common. Union: AI, Robotics, Sports = 1/3 = 33.33%
        # Availability: monday-morning is common. Union: mon-morn, mon-aft = 1/2 = 50.0%
        #
        # Score = (0.4 * 33.33) + (0.3 * 33.33) + (0.15 * 33.33) + (0.15 * 50.0)
        # = 13.332 + 9.999 + 4.9995 + 7.5 = 35.8305
        # Rounded: 36
        
        result = calculate_match_score(user_profile, partner_profile)
        self.assertEqual(result['score'], 36)
        self.assertEqual(result['label'], 'Low')
        self.assertIn('Math', result['commonSubjects'])
        self.assertIn('Python', result['commonSkills'])
        self.assertIn('monday-morning', result['commonAvailability'])

    def test_calculate_match_score_excellent(self):
        user_profile = {
            'subjects': ['Math'],
            'skills': ['Python'],
            'interests': ['AI'],
            'availability': {'monday': ['morning']}
        }
        
        partner_profile = {
            'subjects': ['Math'],
            'skills': ['Python'],
            'interests': ['AI'],
            'availability': {'monday': ['morning']}
        }
        
        result = calculate_match_score(user_profile, partner_profile)
        self.assertEqual(result['score'], 100)
        self.assertEqual(result['label'], 'Excellent')

    def test_profile_completion(self):
        profile = {
            'name': 'Test',
            'college': 'Test College',
            'year': '1',
            'department': 'CSE',
            'subjects': ['A'],
            'skills': ['B'],
            'interests': ['C'],
            'availability': {'monday': ['morning']},
            'partnerType': 'Study'
        }
        # 15 + 10 + 20 + 20 + 15 + 15 + 5 = 100
        self.assertEqual(calculate_profile_completion(profile), 100)

if __name__ == '__main__':
    unittest.main()
