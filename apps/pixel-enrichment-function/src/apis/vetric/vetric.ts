import deepmerge from 'deepmerge';

import { httpGet } from '@/utils/vetric-http';

const apiUrls = [
	'https://api.vetric.io/linkedin/v1/profile/:identifier/overview',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/about',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/experience',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/skills',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/education',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/contact-info',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/activity?type=posts',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/activity?type=comments',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/activity?type=reactions',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/interests?type=influencers',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/interests?type=companies',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/interests?type=groups',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/interests?type=newsletters',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/interests?type=schools',
	'https://api.vetric.io/linkedin/v1/profile/:identifier/languages',
];

export const getEnrichedData = async (linkedinUrl: string) => {
	const allResponses = await Promise.allSettled(apiUrls.map((apiUrl) => httpGet(apiUrl, linkedinUrl, process.env.VETRIC_API_KEY)));
	let baseObject: Record<string, unknown> = {};

	for (const response of allResponses) {
		if (response.status === 'fulfilled') {
			baseObject = deepmerge(baseObject, response.value);
		}
	}

	if (Object.keys(baseObject).length === 0) {
		throw new Error('Empty enriched data');
	}

	return baseObject;
};
