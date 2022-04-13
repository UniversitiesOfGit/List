

const { log } = console;


function avatarPreview(avatarId){
    return `<img width = 80 src = 'https://avatars.githubusercontent.com/u/${ avatarId }?s=80' align = right>`;
}

function badge(badge,link){
    return `[![${ badge }]][${ link }]`;
}

function link(label,link){
    return `[${ label }][${ link }]`;
}



function universityTemplate(university){
    
    const { name , avatar , verified } = university;
    
    let verified_indicator = '';
    
    if(!verified)
        verified_indicator = ` **[❌]**`;
    
    const badges = [];
    
    const { twitter , website , openstreetmap } = university;
    
    if(website)
        badges.push(badge('Website',`${ name } Website`));
        
    if(openstreetmap)
        badges.push(badge('Map',`${ name } Map`));
    
    if(twitter)
        badges.push(badge('Twitter',`${ name } Twitter`));
    
    let extra = '';
    
    const { organizations } = university;
    
    if(organizations)
        for(const [ account , name ] of Object.entries(organizations)){
            extra += `[![](https://img.shields.io/badge/${ name.replaceAll('-','--').replaceAll(' ','_') }-414141?style=for-the-badge&logo=github&logoColor=white)](https://github.com/${ account })`            
        }
    
    return `
    ${ avatarPreview(avatar) }
    
    ### ${ link(`University of ${ name }`,`${ name } Github`) }${ verified_indicator }
    
    ${ badges.join(' ') }
    
    ${ extra }
    `;
}

function countryTemplate(country,universities){
    return `
    ## ${ country }

    <br>

    ---
    
    ${ universities.map(universityTemplate).join('\n---\n') }
    
    ---
    `;
}

function linksFromUniversity(university){
    
    const { name , github , website , twitter , openstreetmap } = university;
    
    const links = [];
    
    links.push(`[${ name } GitHub]: https://github.com/${ github } 'GitHub organization of the University of ${ name }'`);
    links.push(`[${ name } Website]: https://${ website } 'Website of the University of ${ name }'`);
    links.push(`[${ name } Map]: https://www.openstreetmap.org/${ openstreetmap } 'University of ${ name } on OpenStreetMaps'`);
    links.push(`[${ name } Twitter]: https://twitter.com/${ twitter } 'Twitter account of the University of ${ name }'`);
    
    return links;
}

function pageTemplate(universities){
    
    const links = [];
    const groups = [];
    
    const countries = new Map;
    
    universities.forEach((university) => {
        
        const { country } = university;
        
        if(!countries.has(country))
            countries.set(country,[]);
            
        countries.get(country).push(university);
        links.push(...linksFromUniversity(university));
    });
    
    
    countries.forEach((universities,country) => {
        groups.push(countryTemplate(country,universities));
    });
    
    return `
    
    ${ groups.join('\n<br>\n<br>\n\n') }
    
    <br>
    <br>
    <br>
    
    ## Unverified

    Universities are marked with an ❌ if GitHub did not show a \`Verified\` label.

    > We've verified that the organization \<Organization Name\> controls the domain: \<Domain\>

    *Check out **[GitHubs Article][How To Verify]** on the subject.*
    
    ${ links.join('\n') }
    
    [Website]: https://img.shields.io/badge/Website-414141?style=for-the-badge
    [Map]: https://img.shields.io/badge/Map-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white
    [Twitter]: https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white

    [❌]: #unverified 'Github did not show verification that this organization belongs to the universitys website'
    [How To Verify]: https://docs.github.com/en/organizations/managing-organization-settings/verifying-or-approving-a-domain-for-your-organization
    `.split('\n').map((s) => s.trimStart()).join('\n');
}


import { parse } from 'https://deno.land/std@0.134.0/encoding/yaml.ts';

const text = await Deno.readTextFile('Data/Universities.yaml');

const universities = parse(text);

const formatted = pageTemplate(universities.map((uni) => {
    uni.name = uni.university;
    delete uni.university;
    
    return uni;
}));

await Deno.writeTextFile('../Main/README.md',formatted);