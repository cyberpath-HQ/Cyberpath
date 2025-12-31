/**
 * Special hidden career path that is not displayed in the list.
 * This is useful for rendering the default placeholder for the career paths list.
 */
export const CAREER_PATH_SPECIAL_HIDDEN = `__HIDDEN__` as const;

export const CareerPathsList = [
    CAREER_PATH_SPECIAL_HIDDEN,
    `Blue Team Specialist`,
    `Cloud Security Specialist`,
    `Cybersecurity Manager`,
    `Malware Developer`,
    `OSINT Specialist`,
    `Penetration Tester`,
    `Red Team Specialist`,
    `Risk Management Specialist`,
    `Security Operations Specialist`,
    `Threat Hunter`,
] as const;

export type CareerPathsName = typeof CareerPathsList;
export type CareerPathCollection = Array<CareerPathsName[number]>;

interface CareerPathData {
    description: string
    attribution: string
}

export const CareerPathsData: Record<CareerPathsName[number], CareerPathData> = {
    [CAREER_PATH_SPECIAL_HIDDEN]: {
        description: ``,
        attribution: ``,
    },
    [CareerPathsList[1]]:         {
        description: `Defends an organization's networks and systems against cyberattacks. They specialize in incident response, digital forensics, and continuous monitoring of systems for vulnerabilities. Blue Team Specialists play a hands-on role in threat detection and mitigation, ensuring infrastructure resilience and security across the organization.`,
        attribution: `<a href="https://leonardo.ai/" target="_blank" rel="noopener nofollow">Image generated with Leonardo AI</a>`,
    },
    [CareerPathsList[2]]:         {
        description: `Responsible for designing and implementing security measures to protect cloud-based infrastructure and data. Ensures the security of cloud environments, focusing on preventing data breaches, managing access, and maintaining regulatory compliance.`,
        attribution: `<a href="https://leonardo.ai/" target="_blank" rel="noopener nofollow">Image generated with Leonardo AI</a>`,
    },
    [CareerPathsList[3]]:         {
        description: `Leads and manages cybersecurity teams and strategies, overseeing the implementation of security policies, projects, and incident response. Ensures alignment with organizational objectives while mitigating cyber risks and maintaining regulatory compliance.`,
        attribution: `<a href="https://leonardo.ai/" target="_blank" rel="noopener nofollow">Image generated with Leonardo AI</a>`,
    },
    [CareerPathsList[4]]:         {
        description: `Develops and tests exploits to identify vulnerabilities in systems, software, or hardware. Often works in offensive security, creating tools that simulate real-world attacks to improve defensive measures or demonstrate security flaws.`,
        attribution: `<a href="https://www.freepik.com/free-photo/spyware-computer-hacker-virus-malware-concept_16483261.htm" target="_blank" rel="noopener nofollow">Image by rawpixel.com on Freepik</a>`,
    },
    [CareerPathsList[5]]:         {
        description: `Specializes in gathering and analyzing publicly available information (Open-Source Intelligence) to identify potential threats, vulnerabilities, or targets. Uses open data, social media, and public records to support cybersecurity investigations or threat assessments.`,
        attribution: `<a href="https://www.freepik.com/free-photo/person-giving-positive-reactions-social-media_13463118.htm" target="_blank" rel="noopener nofollow">Image by rawpixel.com on Freepik</a>`,
    },
    [CareerPathsList[6]]:         {
        description: `Conducts authorized simulated cyberattacks to identify vulnerabilities in systems, networks, and applications. Provides organizations with detailed insights into their security weaknesses and helps improve their defenses before real attacks occur.`,
        attribution: `<a href="https://www.freepik.com/free-photo/system-hacked-alert-message-computer-screen-hacker-breaking-into-database-server-criminal-cyberattack-malicious-software-password-cracking-program-information-stealing_58629324.htm" target="_blank" rel="noopener nofollow">Image by DC Studio on Freepik</a>`,
    },
    [CareerPathsList[7]]:         {
        description: `Performs offensive security testing, simulating advanced cyberattacks to identify and exploit vulnerabilities. Works with organizations to improve their defensive capabilities by exposing weaknesses from an attacker's perspective.`,
        attribution: `<a href="https://www.freepik.com/free-photo/top-view-laptop-with-lock-chain_18492313.htm" target="_blank" rel="noopener nofollow">Image by freepik</a>`,
    },
    [CareerPathsList[8]]:         {
        description: `Identifies, assesses, and prioritizes potential security risks to an organization's assets. Develops strategies to mitigate these risks, ensuring that both the likelihood and impact of cyber threats are minimized while maintaining business continuity.`,
        attribution: `<a href="https://www.freepik.com/free-photo/concept-solution-domino-effect-slightly-de-focused-close-up-shot-selective-focus_1203372.htm" target="_blank" rel="noopener nofollow">Image by mindandi on Freepik</a>`,
    },
    [CareerPathsList[9]]:         {
        description: `Manages the daily operations of an organization's security infrastructure. They oversee the implementation of security policies, secure system development, and compliance with regulations. Often working within a SOC, they ensure security controls are continuously effective and address both operational security issues and ongoing incident management.`,
        attribution: `<a href="https://www.freepik.com/free-photo/admin-does-server-hub-management_222616629.htm" target="_blank" rel="noopener nofollow">Image by DC Studio on Freepik</a>`,
    },
    [CareerPathsList[10]]:        {
        description: `Actively searches for hidden and advanced threats within an organization's environment. Using a combination of tools, techniques, and threat intelligence, threat hunters detect sophisticated attacks that may bypass traditional security measures, identifying risks early.`,
        attribution: `<a href="https://certify.cybervista.net/cyber-roles-threat-hunter/" target="_blank" rel="noopener nofollow">Image from CyberVista</a>`,
    },
} as const;
