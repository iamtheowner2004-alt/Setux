import os

from dotenv import load_dotenv
from fastapi_mail import (
    ConnectionConfig,
    FastMail,
    MessageSchema
)


load_dotenv()


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


def generate_university_email(problem, university):

    university_name = university.get(
        "name",
        "University"
    )

    problem_title = problem.get(
        "title",
        "Societal Challenge"
    )

    description = problem.get(
        "description",
        ""
    )

    location = problem.get(
        "location",
        ""
    )

    analysis = problem.get(
        "ai_analysis",
        {}
    )

    category = analysis.get(
        "category",
        "Societal Innovation"
    )

    required_expertise = analysis.get(
        "required_expertise",
        []
    )

    expertise_text = ", ".join(
        required_expertise
    )

    subject = (
        f"Collaboration Opportunity: "
        f"{problem_title}"
    )

    body = f"""Dear Sir/Madam,

Greetings from the Societal Innovation Collaboration Portal.

We are reaching out to {university_name} regarding a societal challenge that has been identified through our platform.

Problem Title:
{problem_title}

Location:
{location}

Problem Description:
{description}

Category:
{category}

Relevant Expertise:
{expertise_text}

Based on research relevance and institutional expertise, your institution has been identified as a potential academic partner for studying and developing a solution for this challenge.

We would like to invite your university to review this problem and consider:

- Conducting research related to the challenge
- Forming a multidisciplinary student and faculty team
- Developing an innovative technological or process-based solution
- Collaborating with industry and government stakeholders

If your institution is interested, you may accept the challenge through the collaboration portal.

Thank you for your contribution towards solving real societal challenges.

Regards,

Societal Innovation Collaboration Portal
Government-University-Industry Collaboration Initiative
"""

    return {
        "subject": subject,
        "body": body
    }


def generate_industry_email(problem, recommendation, industry):
    company_name = industry.get("name") or industry.get("company_name", "Industry Partner")
    problem_title = problem.get("title", "Societal Challenge")
    location = problem.get("location") or problem.get("address", "India")

    sol = recommendation.get("solution", {})
    solution_title = sol.get("solution_title", "Technical Innovation Prototype")
    solution_description = sol.get("solution_description", "")
    technologies = ", ".join(sol.get("technologies", ["Sustainable Engineering & Civic Tech"]))

    university_name = problem.get("selected_university", {}).get("name", "Leading Indian Technical University")

    why_recommended = industry.get(
        "why_recommended",
        "Demonstrated manufacturing capability, market presence, and domain expertise in India."
    )
    
    contributions = industry.get(
        "possible_contribution",
        [
            "Industrial fabrication and scaling of the hardware prototype",
            "Pilot deployment support across municipal districts"
        ]
    )

    if isinstance(contributions, list):
        contributions_text = "\n".join([f"- {c}" for c in contributions])
    else:
        contributions_text = f"- {contributions}"

    subject = f"Public-Private Innovation Partnership: Scaling {solution_title} for {problem_title}"

    body = f"""Dear Leadership & Commercialization Team at {company_name},

Greetings from the SetuX Societal Innovation Collaboration Portal.

We are reaching out to invite {company_name} to participate as an official industrial partner in scaling and deploying an academic solution developed for an urgent societal challenge in {location}.

ORIGINAL SOCIETAL PROBLEM:
Title: {problem_title}
Location: {location}
Summary: {problem.get("description", "")[:250]}...

PROPOSED ACADEMIC RESEARCH SOLUTION:
Solution Title: {solution_title}
Developed by Academic Partner: {university_name}
Technical Framework: {solution_description}
Key Technologies: {technologies}

WHY {company_name.upper()} IS RECOMMENDED:
{why_recommended}

POTENTIAL INDUSTRY COLLABORATION SCOPE:
{contributions_text}
- Public-Private-Academic Partnership (PPAP) pilot trial
- Technology transfer and co-development rights

Through this partnership, your organization gains direct access to validated academic research prototypes, faculty expertise, and municipal implementation channels.

Please confirm your interest in this collaboration through the SetuX Collaboration Portal or by replying directly to this communication.

Thank you for your leadership in transforming research into scalable societal impact.

Warm regards,

SetuX Industry Transfer Office
Government-University-Industry Collaboration Initiative
"""

    return {
        "subject": subject,
        "body": body
    }


async def send_email(
    recipient_email: str,
    subject: str,
    body: str
):

    message = MessageSchema(
        subject=subject,
        recipients=[recipient_email],
        body=body,
        subtype="plain"
    )

    fastmail = FastMail(conf)

    await fastmail.send_message(
        message
    )

    return True