
class LawMainController {

  async handle() {
    const context = {}

    context.socialLinks = [
      { label: "facebook", href: "#" },
      { label: "twitter", href: "#" },
      { label: "instagram", href: "#" },
      { label: "youtube", href: "#" }
    ];

    context.menu = [
      { label: "About Us", href: "#" },
      { label: "Treatments", href: "#" },
      { label: "Testimonials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact Us", href: "#" },
    ];

    context.appointment = true;

    context.features = [
      {
        title: "Empathy 2",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Experience 2",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Transparency",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        actionHref: "#",
        actionLabel: "Learn More"
      }
    ];

    context.services = [
      {
        title: "Corporate Law",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Family Law",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Real Estate Law",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Wills & Estates Law",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Civil Litigation",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Criminal Law",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine, ramps microdosing banh mi pug VHS try-hard ugh iceland kickstarter tumblr live-edge tilde.",

        actionHref: "#",
        actionLabel: "Learn More"
      }
    ]

    context.teamMembers = [
      {
        avatar: "/public/templates/lawyers/images/team-04.jpg",
        name: "Holden Caulfield",
        position: "Family Lawyer",
        description: "Crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.",
        socialLinks: [
          {
            name: "Facebook",
            icon: "facebook.stroke",
            url: "#"
          },
          {
            name: "Twitter",
            icon: "twitter.stroke",
            url: "#"
          }
        ]
      },
      {
        avatar: "/public/templates/lawyers/images/team-03.jpg",
        name: "Alper Kamu",
        position: "Corporate Lawyer",
        description: "Crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.",
        socialLinks: [
          {
            name: "Facebook",
            icon: "facebook.stroke",
            url: "#"
          },
          {
            name: "Twitter",
            icon: "twitter.stroke",
            url: "#"
          }
        ]
      },
      {
        avatar: "/public/templates/lawyers/images/team-02.jpg",
        name: "Henry Letham",
        position: "Real Estate Lawyer",
        description: "Crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.",
        socialLinks: [
          {
            name: "Facebook",
            icon: "facebook.stroke",
            url: "#"
          },
          {
            name: "Twitter",
            icon: "twitter.stroke",
            url: "#"
          }
        ]
      },
      {
        avatar: "/public/templates/lawyers/images/team-01.jpg",
        name: "Atticus Finch",
        position: "Family Lawyer",
        description: "Crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.",
        socialLinks: [
          {
            name: "Facebook",
            icon: "facebook.stroke",
            url: "#"
          },
          {
            name: "Twitter",
            icon: "twitter.stroke",
            url: "#"
          }
        ]
      }
    ]

    context.testimonials = [
      {
        name: "John Doe",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard.",
        position: "Senior Analist"
      }
    ]

    context.footer = {
      menu: [
        { url: "#", label: "Corporate Law"},
        { url: "#", label: "Family Law"},
        { url: "#", label: "Real Estate Law"},
        { url: "#", label: "Wills & Estates Law"},
        { url: "#", label: "Civil Litigation"},
        { url: "#", label: "Criminal Law"},
      ],
      socialLinks: [
        {
          name: "facebook",
          label: "Facebook",
          url: "#"
        },
        {
          name: "twitter",
          label: "Twitter",
          url: "#"
        },
        {
          name: "instagram",
          label: "Instagram",
          url: "#"
        },
        {
          name: "youtube",
          label: "Youtube",
          url: "#"
        }
      ]
    }

    return context;
  }
}

module.exports = LawMainController;

