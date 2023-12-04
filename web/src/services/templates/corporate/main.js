


class CorporateMainController {

  async handle(req) {
    const context = {}

    context.socialLinks = [
      { name: "facebook", href: "#" },
      { name: "twitter", href: "#" },
      { name: "instagram", href: "#" },
      { name: "youtube", href: "#" }
    ];

    context.menu = [
      { label: "About Us", href: "#" },
      { label: "Treatments", href: "#" },
      { label: "Testimonials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact Us", href: "#" },
    ];

    context.features = [
      {
        title: "Quick Actions",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        icon: "shower.icon",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Result Driven",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        icon: "heart-rate.icon",
        actionHref: "#",
        actionLabel: "Learn More"
      },
      {
        title: "Absolute Transparency",
        description: "Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy indxgo juice poutine, ramps microdosing banh mi.",
        icon: "bed.icon",
        actionHref: "#",
        actionLabel: "Learn More"
      }
    ];

    context.appointment = true;

    context.testimonials = [
      {
        name: "John Doe",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard.",
        position: "Senior Analist"
      },
      {
        name: "John Doe 1",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard.",
        position: "Senior Analist"
      },
      {
        name: "John Doe 2",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen.",
        position: "Senior Analist"
      }
    ]

    return context;
  }
}

module.exports = CorporateMainController;